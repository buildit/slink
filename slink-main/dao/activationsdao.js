'use strict';

const aws = require('../aws');
const config = require('../config');

async function write({ srCandidateId, sapEmployeeId = 0 } = {}) {
  const params = {
    Item: {
      srCandidateId,
      alias: config.params.LAMBDA_ALIAS.value,
      sapEmployeeId
    },
    TableName: process.env.ACTIVATIONS_TABLE
  };
  return aws.putDynamoDbItem(params);
}

async function read(srCandidateId) {
  const params = {
    Key: {
      srCandidateId: {
        S: srCandidateId
      },
      alias: {
        S: config.params.LAMBDA_ALIAS.value
      },
    },
    TableName: process.env.ACTIVATIONS_TABLE
  };
  return aws.getDynamoDbItem(params);
}

module.exports = {
  write,
  read
};

