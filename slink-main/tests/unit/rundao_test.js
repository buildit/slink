'use strict';

const aws = require('../../aws');
const runDao = require('../../rundao');
const timeSource = require('../../timesource');

jest.mock('../../aws.js');

describe('Run DAO', () => {
  beforeEach(() => {
    process.env.INTRO_RUN_TABLE = 'testing';
    aws.putDynamoDb.mockClear();
  });

  it('write saves a valid item to DynamoDb', async () => {
    runDao.write('abc123', 12345);
    const params = {
      Item: {
        requestId: {
          S: 'abc123'
        },
        runSerialDate: {
          N: '12345'
        }
      },
      TableName: 'testing'
    };
    expect(aws.putDynamoDb).toHaveBeenCalledWith(params);
  });
});
