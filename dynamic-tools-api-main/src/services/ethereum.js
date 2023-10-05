const Web3 = require('web3');
const _ = require('lodash');
const logger = require('./logger');
const { InvalidServerParameterError, MissingConfigurationParameter } = require('./errors');
const applicationInfoService = require('./application-info');
const marketSummaryService = require('./market-summary');
const Transaction = require('../models/transaction');
const transactionHandlerService = require('./ethereum-transaction-handler');

const { ETHEREUM_BLOCK_CHUNK_SIZE, ETHEREUM_RPC_API_URL, COLLECT_TRANSACTION_DATA } = process.env;
const ethereumBlockChunkSize = ETHEREUM_BLOCK_CHUNK_SIZE ? Number(ETHEREUM_BLOCK_CHUNK_SIZE) : 10;

const collectTransactionData = COLLECT_TRANSACTION_DATA === 'true';

class EthereumService {
  constructor() {
    if (!ETHEREUM_RPC_API_URL) {
      throw new MissingConfigurationParameter('ETHEREUM_RPC_API_URL');
    }

    // Initialize the web3 client for getting the data from ANKR
    this.client = new Web3(new Web3.providers.HttpProvider(ETHEREUM_RPC_API_URL));
  }

  getClient() {
    return this.client;
  }

  // Retrieve the NFT transaction data using ANKR JSON rpc service starting from the specified block number
  async getBlockChunkTransactionData(startBlockNumber) {
    if (startBlockNumber && (!_.isNumber(startBlockNumber) || startBlockNumber < 0)) {
      throw new InvalidServerParameterError('getBlockChunkTransactionData(startBlockNumber)');
    }

    if (!startBlockNumber) {
      startBlockNumber = 0;
    }

    if (!_.isNumber(ethereumBlockChunkSize) || ethereumBlockChunkSize < 1) {
      throw new InvalidServerParameterError('getBlockChunkTransactionData(blockChunkSize)');
    }

    // Get the latest available Ethereum block number
    const lastBlockNumber = await this.client.eth.getBlockNumber();

    if (startBlockNumber > lastBlockNumber) {
      throw new InvalidServerParameterError('getBlockChunkTransactionData(startBlockNumber)');
    }

    const chunkTransactions = [];
    let handledBlocksAmount = 0;
    let currentBlockNumber = startBlockNumber;
    let continueFlow = true;

    // Run the algorithm until the latest available block is handled
    while (handledBlocksAmount < ethereumBlockChunkSize && currentBlockNumber <= lastBlockNumber) {
      logger.debug(
        `EthereumService getBlockChunkTransactionData(): Getting the block data for block ${currentBlockNumber}`
      );

      // Get the Ethereum block data including the list of transactions
      const blockData = await this.client.eth.getBlock(currentBlockNumber, true);

      if (blockData) {
        // Ignore the block if it doesn't contain the timestamp
        if (currentBlockNumber > 0 && !blockData.timestamp) {
          logger.debug(
            `EthereumService getBlockChunkTransactionData(): Block ${currentBlockNumber} doesn't have the timestamp, stopping the flow`
          );
          continueFlow = false;
          break;
        }

        const transactions = blockData.transactions && blockData.transactions.length ? blockData.transactions : [];

        logger.debug(
          `EthereumService getBlockChunkTransactionData(): Found ${transactions.length} transactions for block ${currentBlockNumber}`
        );

        for (let i = 0; i < transactions.length; i++) {
          const transactionData = transactions[i];

          if (_.isObject(transactionData) && transactionData.hash) {
            const txnHash = transactionData.hash;

            // Handle the transaction only if it can be handled by application  (there is handler for associated contract address)
            if (transactionData.to && transactionHandlerService.canHandle(transactionData)) {
              logger.debug(
                `EthereumService getBlockChunkTransactionData(): Transaction ${txnHash} can be handled / saved to the DB`
              );

              // Get the transaction receipt
              const transactionReceiptData = await this.client.eth.getTransactionReceipt(txnHash);

              if (_.isObject(transactionReceiptData)) {
                Object.assign(transactionData, transactionReceiptData);
              }

              // Populate the extra field for the transaction based on the receipt data
              transactionHandlerService.handleData(transactionData);
              transactionData.timestamp = new Date(blockData.timestamp * 1000);

              chunkTransactions.push(transactionData);
            }
          }
        }
      }

      handledBlocksAmount += 1;
      currentBlockNumber += 1;

      if (currentBlockNumber > lastBlockNumber) {
        continueFlow = false;
      }
    }

    return {
      continueFlow,
      nextBlockNumber: continueFlow ? currentBlockNumber : currentBlockNumber - 1,
      data: chunkTransactions,
    };
  }

  // Start the NFT transaction collection process for the last handled ethereum block
  // (it is retrieved from the application info DB record; 0 is used for the first flow run)
  async collectTransactionData() {
    if (!collectTransactionData) {
      logger.debug('EthereumService collectTransactionData(): Process is disabled');

      return;
    }

    if (this.isRefreshInProgress) {
      logger.debug('EthereumService collectTransactionData(): Refresh is already in progress');

      return;
    }

    this.isRefreshInProgress = true;

    let runFlow = true;
    let batchIndex = 0;

    // Get the latest handled block number from the application info DB table
    const applicationInfo = await applicationInfoService.getApplicationInfo();

    let blockNumber =
      applicationInfo && _.isNumber(applicationInfo.lastHandledEthereumBlock)
        ? Math.max(0, applicationInfo.lastHandledEthereumBlock)
        : 0;

    logger.info(`EthereumService collectTransactionData() Last handled block number is ${blockNumber}`);

    try {
      while (runFlow) {
        // Handle the new chunk of Ethereum blocks
        const output = await this.getBlockChunkTransactionData(blockNumber);

        if (output) {
          if (output.data) {
            logger.info(`Ethereum block data is retrieved for batch ${batchIndex}, saving to DB`);

            // Handle the transaction list and save to DB
            await this.handleTransactionList(output.data);

            // Update the application info DB record with the latest handled ethereum block
            await applicationInfoService.updateApplicationInfo({
              lastHandledEthereumBlock: output.nextBlockNumber,
            });

            if (output.continueFlow) {
              blockNumber = output.nextBlockNumber;
              batchIndex++;
            } else {
              logger.debug('EthereumService collectTransactionData() Got signal to stop the flow');
              runFlow = false;
            }
          } else {
            logger.debug(
              `EthereumService collectTransactionData() Invalid data collected for batch ${batchIndex}; stopping the flow`
            );
            runFlow = false;
          }
        } else {
          logger.debug(
            `EthereumService collectTransactionData() No data collected for batch ${batchIndex}; stopping the flow`
          );
          runFlow = false;
        }
      }
    } catch (err) {
      console.error(err);
    }

    this.isRefreshInProgress = false;
  }

  // Save the transaction data to DB for the handled ethereum block chunk
  async handleTransactionList(transactionList) {
    if (!transactionList || !transactionList.length) {
      return;
    }

    const newHashList = transactionList.map((txn) => txn.hash).filter((v) => !!v);

    const nftTransactionsToUpdate = [];
    const nftTransactionsToAdd = [];

    const existingTransactions = await Transaction.find({ hash: { $in: newHashList } })
      .select({ hash: 1 })
      .lean();
    const existingTxnHashList = existingTransactions.map((item) => item.hash);

    // Check whether the txn must be updated in DB or this is a new record
    transactionList.forEach((item) => {
      if (!item || !item.hash) {
        return;
      }

      if (existingTxnHashList.indexOf(item.hash) === -1) {
        nftTransactionsToAdd.push(item);
      } else {
        nftTransactionsToUpdate.push(item);
      }
    });

    logger.info(
      `EthereumService handleTransactionList(): ${nftTransactionsToAdd.length} records to add; ${nftTransactionsToUpdate.length} records to update`
    );

    // Save the new transactions to DB
    await Transaction.insertMany(nftTransactionsToAdd);

    // Update the existing transactionds in DB
    for (let i = 0; i < nftTransactionsToUpdate.length; i++) {
      const txnToUpdate = nftTransactionsToUpdate[i];
      await Transaction.updateOne({ hash: txnToUpdate.hash }, txnToUpdate);
    }
  }

  async updateBlockNumberInfo() {
    const blockNumber = await this.client.eth.getBlockNumber();

    await marketSummaryService.updateMarketSummary({
      lastEthereumBlockNumber: blockNumber,
    });
  }
}

const ethereumService = new EthereumService();

module.exports = ethereumService;
