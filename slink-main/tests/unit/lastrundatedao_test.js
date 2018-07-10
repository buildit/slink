'use strict';

const aws = require('../../aws');
const lastRunDateDao = require('../../lastrundatedao');
const config = require('../../config');

jest.mock('../../aws');
jest.mock('../../config');

describe('Run DAO', () => {
  beforeEach(() => {
    process.env.LAST_RUN_DATE_TABLE = 'testing';
    aws.putDynamoDbItem.mockClear();
  });

  it('write saves a valid run item to DynamoDb', async () => {
    config.params.LAMBDA_ALIAS = { value: 'foo' };

    await lastRunDateDao.write('abc123', 12345);
    const params = {
      Item: {
        alias: {
          S: 'foo'
        },
        requestId: {
          S: 'abc123'
        },
        runSerialDate: {
          N: '12345'
        }
      },
      TableName: 'testing'
    };
    expect(aws.putDynamoDbItem).toHaveBeenCalledWith(params);
  });

  it('read obtains an item from DynamoDb', async () => {
    config.params.LAMBDA_ALIAS = { value: 'foo' };

    await lastRunDateDao.read();
    const params = {
      Key: {
        alias: {
          S: 'foo'
        }
      },
      TableName: 'testing'
    };
    expect(aws.getDynamoDbItem).toHaveBeenCalledWith(params);
  });
});
