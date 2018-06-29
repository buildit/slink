'use strict';

const getType = require('jest-get-type');
const index = require('../../index');
const introduction = require('../../introduction');
const config = require('../../config');
const runDao = require('../../rundao');

jest.mock('../../introduction');
jest.mock('../../config');
jest.mock('../../rundao');

const context = {
  invokedFunctionArn: 'unit-test',
  awsRequestId: 'requestid'
};

describe('Handler invocation', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods
    introduction.process.mockClear();
  });

  it('runs introduction process and gives successful response', async () => {
    introduction.process.mockResolvedValue({ applicantsIntroducedToSap: [{ id: 'abc-123' }] });

    await index.handler({}, context, (err, result) => {
      expect(result.statusCode).toEqual(200);
      expect(getType(result.body)).toEqual('string');
      expect(result.body).toEqual(JSON.stringify({ message: 'Sent 1 candidate(s) to SAP' }));
      expect(runDao.write).toHaveBeenCalledWith('requestid');
    });
  });

  it('runs introduction process and gives unsuccessful response if issues', async () => {
    config.loadConfigParams.mockResolvedValue({ SAP_ADD_EMPLOYEE_URL: '' });
    introduction.process.mockRejectedValue(new Error('Some random error occurred'));
    await index.handler({}, context, (err, result) => {
      console.log(`error: ${err}`);
      expect(result.statusCode).toEqual(500);
      expect(getType(result.body)).toEqual('object');
      expect(result.body).toEqual({ message: 'Error: Some random error occurred' });
    });
  });
});

