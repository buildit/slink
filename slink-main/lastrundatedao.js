'use strict';

const aws = require('./aws');
const config = require('./config');

async function write(requestId, runSerialDate) {
  const alias = config.params.LAMBDA_ALIAS;
  console.log(`'alias', ${JSON.stringify(alias)}`);

  const params = {
    Item: {
      alias: {
        S: alias.value
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
  await aws.putDynamoDb(params);
}

module.exports = {
  write
};

