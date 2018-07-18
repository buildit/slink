'use strict';

const aws = require('../aws');
const config = require('../config');

async function write({ srCandidateId, slinkResumeNumber = 0, sapEmployeeId = 0 } = {}) {
  const params = {
    Item: {
      srCandidateId,
      alias: config.params.LAMBDA_ALIAS.value,
      slinkResumeNumber,
      sapEmployeeId
    },
    TableName: process.env.INTRODUCTIONS_TABLE
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
    TableName: process.env.INTRODUCTIONS_TABLE
  };
  return aws.getDynamoDbItem(params);
}

module.exports = {
  write,
  read
};

