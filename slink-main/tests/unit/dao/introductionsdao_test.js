'use strict';

const aws = require('../../../aws');
const applicantDao = require('../../../dao/introductionsdao');
const config = require('../../../config');

jest.mock('../../../aws');
jest.mock('../../../config');

describe('Introductions DAO', () => {
  beforeEach(() => {
    config.params.LAMBDA_ALIAS = { value: 'baz' };
    process.env.INTRODUCTIONS_TABLE = 'Introductions';

    aws.putDynamoDbItem.mockClear();
  });

  it('write saves a valid applicant item to DynamoDb', async () => {
    await applicantDao.write({
      srCandidateId: 'candidateId',
      slinkResumeNumber: 'resumeNumber',
      sapEmployeeId: 12345
    });

    const params = {
      Item: {
        alias: 'baz',
        srCandidateId: 'candidateId',
        slinkResumeNumber: 'resumeNumber',
        sapEmployeeId: 12345
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
