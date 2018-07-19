'use strict';

const aws = require('../../../aws');
const runsDao = require('../../../dao/runsdao');
const config = require('../../../config');

jest.mock('../../../aws');
jest.mock('../../../config');

describe('Runs DAO', () => {
  beforeEach(() => {
    process.env.RUNS_TABLE = 'testing';
    aws.putDynamoDbItem.mockClear();
  });

  it('write saves a valid run item to DynamoDb', async () => {
    config.params.LAMBDA_ALIAS = { value: 'foo' };

    await runsDao.write('abc123', 12345, {
      this: 'this',
      that: 'that',
      other: 'other'
    });

    const params = {
      Item: {
        requestId: 'abc123',
        alias: 'foo',
        runSerialDate: 12345,
        result: {
          this: 'this',
          that: 'that',
          other: 'other'
        }
      },
      TableName: 'testing'
    };
    expect(aws.putDynamoDbItem).toHaveBeenCalledWith(params);
  });

  it('read obtains an item from DynamoDb', async () => {
    config.params.LAMBDA_ALIAS = { value: 'foo' };

    await runsDao.read('requestId');
    const params = {
      Key: {
        requestId: {
          S: 'requestId'
        },
        alias: {
          S: 'foo'
        }
      },
      TableName: 'testing'
    };
    expect(aws.getDynamoDbItem).toHaveBeenCalledWith(params);
  });
});
