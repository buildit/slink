'use strict';

const aws = require('../aws');
const config = require('../config');

async function write({ srCandidateId, slinkResumeNumber = '', sapEmployeeId = '' } = {}) {
  const params = {
    Item: {
      alias: {
        S: config.params.LAMBDA_ALIAS.value
      },
      srCandidateId: {
        S: srCandidateId
      },
      slinkResumeNumber: {
        S: slinkResumeNumber
      },
      sapEmployeeId: {
        S: sapEmployeeId
      }
    },
    TableName: process.env.APPLICANT_TABLE
  };
  return aws.putDynamoDbItem(params);
}

async function read(srCandidateId) {
  const params = {
    Key: {
      alias: {
        S: config.params.LAMBDA_ALIAS.value
      },
      srCandidateId: {
        S: srCandidateId
      },
    },
    TableName: process.env.APPLICANT_TABLE
  };
  return aws.getDynamoDbItem(params);
}

module.exports = {
  write,
  read
};

