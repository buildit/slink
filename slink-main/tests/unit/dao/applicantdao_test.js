'use strict';

const aws = require('../../../aws');
const applicantDao = require('../../../dao/applicantdao');
const config = require('../../../config');

jest.mock('../../../aws');
jest.mock('../../../config');

describe('Applicant DAO', () => {
  beforeEach(() => {
    config.params.LAMBDA_ALIAS = { value: 'baz' };
    process.env.APPLICANT_TABLE = 'applicant';

    aws.putDynamoDbItem.mockClear();
  });

  it('write saves a valid item to DynamoDb', async () => {
    return applicantDao.write({
      srCandidateId: 'candidateId',
      slinkResumeNumber: 'resumeNumber',
      sapEmployeeId: 'employeeId'
    })
      .then(() => {
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
              S: 'employeeId'
            }
          },
          TableName: 'applicant'
        };
        expect(aws.putDynamoDbItem)
          .toHaveBeenCalledWith(params);
      });
  });

  it('read obtains an applicant item from DynamoDb', async () => {
    return applicantDao.read('candidateId')
      .then(() => {
        const params = {
          Key: {
            alias: {
              S: 'baz'
            },
            srCandidateId: {
              S: 'candidateId'
            }
          },
          TableName: 'applicant'
        };
        expect(aws.getDynamoDbItem)
          .toHaveBeenCalledWith(params);
      });
  });
});
