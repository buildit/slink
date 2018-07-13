'use strict';

const aws = require('../aws');
const config = require('../config');

async function write({ srCandidateId, sapEmployeeId = 0, sapActivated = true } = {}) {
  const params = {
    Item: {
      srCandidateId: {
        S: srCandidateId
      },
      alias: {
        S: config.params.LAMBDA_ALIAS.value
      },
      sapEmployeeId: {
        N: `${sapEmployeeId}`
      },
      sapActivated: {
        BOOL: sapActivated
      }
    },
    TableName: process.env.APPLICANT_TABLE
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
    TableName: process.env.APPLICANT_ACTIVATION_TABLE
  };
  return aws.getDynamoDbItem(params);
}

module.exports = {
  write,
  read
};

