'use strict';

const aws = require('../../aws.js');
const runDao = require('../../rundao.js');

jest.mock('../../aws.js');

describe('Run DAO', () => {
  beforeEach(() => {
    process.env.INTRO_RUN_TABLE = 'testing';
    aws.putDynamoDb.mockClear();
  });

  it('write saves a valid item to DynamoDb', async () => {
    runDao.write('abc123');
    const params = {
      Item: {
        requestId: {
          S: 'abc123'
        }
      },
      TableName: 'testing'
    };
    expect(aws.putDynamoDb).toHaveBeenCalledWith(params);
  });
});
