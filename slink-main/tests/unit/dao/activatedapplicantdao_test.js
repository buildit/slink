'use strict';

const aws = require('../../../aws');
const applicantDao = require('../../../dao/activatedapplicantdao');
const config = require('../../../config');

jest.mock('../../../aws');
jest.mock('../../../config');

describe('Activated Applicant DAO', () => {
  beforeEach(() => {
    config.params.LAMBDA_ALIAS = { value: 'baz' };
    process.env.ACTIVATED_APPLICANT_TABLE = 'activatedapplicant';

    aws.putDynamoDbItem.mockClear();
  });

  it('write saves a valid activated applicant item to DynamoDb', async () => {
    await applicantDao.write({
      srCandidateId: 'candidateId',
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
        sapEmployeeId: {
          N: 'employeeId'
        }
      },
      TableName: 'activatedapplicant'
    };
    expect(aws.putDynamoDbItem)
      .toHaveBeenCalledWith(params);
  });

  it('read obtains an activated applicant item from DynamoDb', async () => {
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
      TableName: 'activatedapplicant'
    };
    expect(aws.getDynamoDbItem)
      .toHaveBeenCalledWith(params);
  });
});
