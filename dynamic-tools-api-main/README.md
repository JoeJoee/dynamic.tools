# dynamic.tools-api

## Prerequisites

- NodeJS: 14.18.0+
- NPM: 6.14.15+
- MongoDB

## Getting started

- Install packages with `yarn` or `npm install`
- Copy `.env.sample` to `.env` and fill the file with correct informations

## Start the application

- `npm run start` or `yarn start`

## Start the application in the livereload mode

- `npm run dev` or `yarn dev`

## Environment variables

`ETHEREUM_RPC_API_URL` - the URL of JSON RPC service used for web3 tool (ANKR Ethereum service URL)

`ETHEREUM_BLOCK_CHUNK_SIZE` - the maximum amount of blocks to be handled in one transaction data retrieval algorithm run

`OPENSEA_API_URL` - the Opensea REST API URL

`NFT_PAGE_SIZE` - the default page size value to be used in the calls to REST API Opensea service (maximum value is 300)

`NFT_MAX_OFFSET` - the maximum page offset value to be used in the calls to REST API Opensea service (maximum value is 50000)

`SENTRY_DSN` - the Sentry DSN URL, used for the log / error collection

`NODE_ENV` - the environment value to be used in the NodeJS application

`PORT` - a port on which the http server will be listening for the incoming requests

`API_PREFIX` - the default prefix to be used for the http server

`LOG_LEVEL` - default log level to be used by the embedded application logger

`DB_URL` - the URL to be used for MongoDB connection

`DB_NAME` - the database name to be used for MongoDB connection

`DB_ENV` - enables the debug mode for the mongoose library if set to 'development'

`JWT_SECRET` - the secret string that will be used for JWT generation
`JWT_EXPIRATION_HOURS` - the number of hours when the JWT token will remain active

## Analytics functionality

### Ethereum transactions

All ehtereum transactions handled via the SeaPort contract are collected in the database by checking the data of each Ethereum block added to the chain. The data is collected via web3 compatible ANKR RPC API. For each newly collected transaction we get the buyer and sell address, this is how we get the list of addresses who ever was involved into SeaPort transactions.

### NFT Collections

As per the configured CRON task, the application regularly gets all NFT collections owned by somebody from the list of
addresses extracted from the Ethereum transactions. The NFT collections are retrieved via the calls to the public OpenSea REST API.

### NFT Asset events

The application uses the OpenSea asset events as the main data source for the analytics functionality of the application.
By default, the asset events are collected for the collection only if its total volums is more than 2000 ETH (Once a day the application gets the latest statistics of the collections and finds out if any new collections have reached the 2000 ETH threshold)

The asset events are collected for 3 event types only:

- 'created' - Listing events
- 'successfull' - Sales events
- 'cancelled' - Cancellation of the active listing

The events are collected via the HTTP calls to the secured OpenSea REST API, 300 events maximum can be retrieved for one collection by sending one HTTP request.

### Trading history calculations

When all asset events have been collected for the NFT collection (we check for the presence of 'lastCollectedEventDate' field on the collection),
the application starts to calculate the trading history data for each hour starting from the collection's creation date. The trading history data includes the following parameters:

- Total Volume
- Open floor price
- Close floor price
- Low floor price
- High floor price
