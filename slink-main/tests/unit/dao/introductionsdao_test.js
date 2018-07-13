'use strict';

const aws = require('../../../aws');
const applicantDao = require('../../../dao/introductionsdao');
const config = require('../../../config');

jest.mock('../../../aws');
jest.mock('../../../config');

describe('Applicant DAO', () => {
  beforeEach(() => {
    config.params.LAMBDA_ALIAS = { value: 'baz' };
    process.env.INTRODUCTIONS_TABLE = 'Introductions';

    aws.putDynamoDbItem.mockClear();
  });

  it('write saves a valid applicant item to DynamoDb', async () => {
    await applicantDao.write({
      srCandidateId: 'candidateId',
      slinkResumeNumber: 'resumeNumber',
      sapEmployeeId: 'employeeId'
    });

    const params = {
      Item: {
        alias: {
          S: 'baz'
        },
        srCandidateId: {
          S: 'candidateId'
        },
        slinkResumeNumber: {
          S: 'resumeNumber'
        },
        sapEmployeeId: {
          N: 'employeeId'
        }
      },
      TableName: 'Introductions'
    };
    expect(aws.putDynamoDbItem)
      .toHaveBeenCalledWith(params);
  });

  it('read obtains an applicant item from DynamoDb', async () => {
    await applicantDao.read('candidateId');

    const params = {
      Key: {
        srCandidateId: {
          S: 'candidateId'
        },
        alias: {
          S: 'baz'
        }
      },
      TableName: 'Introductions'
    };
    expect(aws.getDynamoDbItem)
      .toHaveBeenCalledWith(params);
  });
});
