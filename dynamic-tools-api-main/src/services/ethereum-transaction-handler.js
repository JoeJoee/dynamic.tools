const _ = require('lodash');
const InputDataDecoder = require('ethereum-input-data-decoder');
const path = require('path');
const BigNumber = require('bignumber.js');

const contractHandlers = {
  // Seaport 1.1 contract address : https://etherscan.io/address/0x00000000006c3852cbef3e08e8df289169ede581
  '0x00000000006c3852cbef3e08e8df289169ede581': {
    contractName: 'Seaport 1.1',
    handle: (txn) => {
      const TRANSFER_TOPIC_NAME = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
      const WETH_ADDRESS_NAME = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
      const weiToEthConvertionCoefficient = 10 ** -18;

      // Initialize the ethereum input decoder for the given contract ABI file
      const inputDecoder = new InputDataDecoder(path.resolve(process.cwd(), 'data/opensea-abi.json'));

      // backup the input before decoding it
      txn.rawInput = txn.input;
      delete txn.input;

      // decode the input because the client wants to see the decoded version of the input parameters
      if (txn.rawInput) {
        txn.input = inputDecoder.decodeData(txn.rawInput);
      }

      if (!txn.logs || !txn.logs.length) {
        return txn;
      }

      const txnLogs = txn.logs;

      // Get the TRANSFER log entries
      const transferLogEntries = txnLogs.filter((logEntry) => {
        if (!logEntry || !logEntry.address || !logEntry.topics || !logEntry.topics.length) {
          return;
        }

        return _.toLower(logEntry.topics[0]) === TRANSFER_TOPIC_NAME;
      });

      // Extract the useful information from the TRANSFER log entries - seller address,
      // buyer address, price, token ID and collection address
      txn.transfers = transferLogEntries.map((entry) => {
        const transfer = {};

        transfer.assetAddress = _.toLower(entry.address);

        if (entry.topics[1]) {
          transfer.sellerAddress = `0x${_.toLower(entry.topics[1].slice(-40))}`;
        }

        if (entry.topics[2]) {
          transfer.buyerAddress = `0x${_.toLower(entry.topics[2].slice(-40))}`;
        }

        if (entry.topics[3]) {
          transfer.assetTokenId = parseInt(entry.topics[3], 16);
        }

        if (txn.value && transferLogEntries.length === 1) {
          transfer.price = Number(txn.value) * weiToEthConvertionCoefficient;
        } else if (entry.address === WETH_ADDRESS_NAME) {
          transfer.price = new BigNumber(entry.data).toFixed() * weiToEthConvertionCoefficient;
        }

        return transfer;
      });

      return txn;
    },
  },
};

class EthereumTransactionHandler {
  /**
   * @property txn : transation that was retrieved
   */
  handleData(txn) {
    if (!this.canHandle(txn)) {
      return txn;
    }

    const handlerData = contractHandlers[_.toLower(txn.to)];

    if (!handlerData) {
      return txn;
    }

    if (_.isFunction(handlerData.handle)) {
      handlerData.handle(txn);
    }

    return txn;
  }

  canHandle(txn) {
    if (!txn || !txn.to) {
      return false;
    }

    return !!contractHandlers[_.toLower(txn.to)];
  }
}

module.exports = new EthereumTransactionHandler();
