'use strict';

const aws = require('./aws');

async function write(requestId) {
  const params = {
    Item: {
      requestId: {
        S: requestId
      }
    },
    TableName: process.env.INTRO_RUN_TABLE
  };
  await aws.putDynamoDb(params);
}

module.exports = {
  write
};

