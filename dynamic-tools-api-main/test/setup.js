const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
// const request = require('supertest');
// const faker = require('faker');
const fs = require('fs');
const d = require('debug');
const { execSync } = require('child_process');
const server = require('../src/index');

const debug = d('test:setup');
// const { getMockReq, getMockRes } = require('@jest-mock/express');

const ApplicationInfo = require('../src/models/application-info');
const MarketSummary = require('../src/models/market-summary');
const { applicationInfo, marketSummary } = require('./default-data');

global.console = {
  ...console,
  trace: () => '',
};

const isServerReady = false;

console.log('UNIT TESTS CONFIG\n');
console.table({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  DB_NAME: process.env.DB_NAME,
});

const deleteDbData = async () => {
  await ApplicationInfo.deleteMany({});
  await MarketSummary.deleteMany({});
};

const addDefaultData = async () => {
  await ApplicationInfo.create(applicationInfo);
  await MarketSummary.create(marketSummary);
};

const setupDbData = async () => {
  await deleteDbData();
  await addDefaultData();
};

debug('Setup start');
const setup = async () => {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        reject(new Error('setup timeout'));
      }, 60000);

      if (mongoose.connection.readyState) {
        return setupDbData().then(() => resolve(server));
      }

      mongoose.connection.on('connected', async () => {
        return setupDbData().then(() => resolve(server));
      });

      resolve(server);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = setup;
