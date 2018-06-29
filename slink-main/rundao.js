'use strict';

const aws = require('./aws');

async function write(requestId, runSerialDate) {
  const params = {
    Item: {
      requestId: {
        S: requestId
      },
      runSerialDate: {
        N: `${runSerialDate}`
      }
    },
    TableName: process.env.INTRO_RUN_TABLE
  };
  await aws.putDynamoDb(params);
}

module.exports = {
  write
};

