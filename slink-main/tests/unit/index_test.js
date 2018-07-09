'use strict';

const getType = require('jest-get-type');
const index = require('../../index');
const introduction = require('../../introduction');
const config = require('../../config');
const runDao = require('../../lastrundatedao');
const timeSource = require('../../timesource');

jest.mock('../../introduction');
jest.mock('../../config');
jest.mock('../../lastrundatedao');
jest.mock('../../timesource');

const context = {
  invokedFunctionArn: 'unit-test',
  awsRequestId: 'requestid'
};

describe('Handler invocation', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods
    introduction.process.mockClear();
    timeSource.getSerialTime.mockClear();
  });

  it('runs introduction process and gives successful response', async () => {
    introduction.process.mockResolvedValue({
      attempted: 2,
      successful: 1,
      unsuccessful: 1,
      successfulApplicants: [{ id: 'abc-123' }],
      unsuccessfulApplicants: [{ id: 'xyz-890' }]
    });
    timeSource.getSerialTime.mockReturnValue(2222);
    runDao.read.mockReturnValue({ Item: { runSerialDate: { N: 1111 } } });

    await index.handler({}, context, (err, result) => {
      expect(runDao.read).toHaveBeenCalledWith();
      expect(introduction.process).toHaveBeenCalledWith(new Date(1111).toISOString());
      expect(result.statusCode).toEqual(200);
      expect(getType(result.body)).toEqual('string');
      expect(result.body).toEqual(JSON.stringify({ message: 'Sent 1 candidate(s) to SAP, failed: 1' }));
      expect(runDao.write).toHaveBeenCalledWith('requestid', 2222);
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

