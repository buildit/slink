'use strict';

const log = require('../log');
const { LOG_INFO } = require('../constants');

const aws = require('../aws');
const config = require('../config');

/**
 * @param requestId The Lambda request ID
 * @param runSerialDate Date/time represented as a long value (as returned by `Date.getSerialTime()`).
 * @param result An object representing the run result (expected to be the response object returned by the Lambda)
 * @return {Promise<*>}
 */
async function write(requestId, runSerialDate, result) {
  const table = process.env.RUNS_TABLE;
  log(LOG_INFO, `Writing to table: ${table}`);

  const params = {
    Item: {
      requestId,
      alias: config.params.LAMBDA_ALIAS.value,
      runSerialDate,
      result
    },
    TableName: table
  };
  return aws.putDynamoDbItem(params);
}

async function read(requestId) {
  const params = {
    Key: {
      requestId: {
        S: requestId
      },
      alias: {
        S: config.params.LAMBDA_ALIAS.value
      }
    },
    TableName: process.env.RUNS_TABLE
  };
  return aws.getDynamoDbItem(params);
}

module.exports = {
  write,
  read
};

