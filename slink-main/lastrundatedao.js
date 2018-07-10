'use strict';

const aws = require('./aws');
const config = require('./config');

async function write(requestId, runSerialDate) {
  const params = {
    Item: {
      alias: {
        S: config.params.LAMBDA_ALIAS.value
      },
      requestId: {
        S: requestId
      },
      runSerialDate: {
        N: `${runSerialDate}`
      }
    },
    TableName: process.env.LAST_RUN_DATE_TABLE
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

