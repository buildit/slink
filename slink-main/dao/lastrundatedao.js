'use strict';

const log = require('../log');
const { LOG_INFO } = require('../constants');

const aws = require('../aws');
const config = require('../config');

async function write(requestId, runSerialDate) {
  const table = process.env.LAST_RUN_DATE_TABLE;
  log(LOG_INFO, `Writing to table: ${table}`);

  const params = {
    Item: {
      alias: config.params.LAMBDA_ALIAS.value,
      requestId,
      runSerialDate
    },
    TableName: table
  };
  return aws.putDynamoDbItem(params);
}

async function read() {
  const params = {
    Key: {
      alias: {
        S: config.params.LAMBDA_ALIAS.value
      }
    },
    TableName: process.env.LAST_RUN_DATE_TABLE
  };
  return aws.getDynamoDbItem(params);
}

module.exports = {
  write,
  read
};

