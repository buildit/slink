'use strict';

const getType = require('jest-get-type');
const index = require('../../index');
const introduction = require('../../introduction');
const activation = require('../../activation');
const config = require('../../config');
const runDao = require('../../dao/lastrundatedao');
const timeSource = require('../../timesource');

jest.mock('../../introduction');
jest.mock('../../activation');
jest.mock('../../config');
jest.mock('../../dao/lastrundatedao');
jest.mock('../../timesource');

const context = {
  invokedFunctionArn: 'unit-test',
  awsRequestId: 'requestid'
};

describe('Handler invocation', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods
    introduction.process.mockClear();
    activation.process.mockClear();
    timeSource.getSerialTime.mockClear();
  });

  it('runs introduction process and gives successful response', async () => {
    const introductionResult = {
      attempted: 2,
      successful: 1,
      unsuccessful: 1,
      successfulApplicants: [{ id: 'abc-123' }],
      unsuccessfulApplicants: [{ id: 'xyz-890' }]
    };
    introduction.process.mockResolvedValue(introductionResult);

    const activationResult = {
      attempted: 5,
      successful: 2,
      unsuccessful: 3,
      successfulApplicants: [{ id: 'abc-123' }],
      unsuccessfulApplicants: [{ id: 'xyz-890' }]
    };
    activation.process.mockResolvedValue(activationResult);

    const expectedResult = {
      statusCode: 200,
      body: {
        introductionResult,
        activationResult,
        message: 'Candidate(s) introduced to SAP: 1, failed: 1. Candidate(s) activated in SAP: 2, failed: 3.'
      }
    };

    timeSource.getSerialTime.mockReturnValue(2222);

    await index.handler({}, context, (err, result) => {
      expect(introduction.process).toHaveBeenCalled();
      expect(activation.process).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
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

