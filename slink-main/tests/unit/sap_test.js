'use strict';

const axios = require('axios');
const sap = require('../../sap');

jest.mock('axios');

// Not sure about ReturnFlag value for a good response.  Below is just a guess for now.
const mockResponseGood = {
  output: {
    ReturnFlag: 'T',
    ReturnMessage: 'some return message',
    EmployeeId: '123456'
  }
};

const mockResponseBad = {
  output: {
    ReturnFlag: 'F',
    ReturnMessage: 'some return message',
    EmployeeId: '0'
  }
};

const applicant = {};


describe('Post Employee Data', () => {
  beforeAll(() => {
    process.env.SAP_USERNAME = 'username';
    process.env.SAP_PASSWORD = 'password';
    process.env.SR_CANDIDATE_SUMMARY_URL = 'http://mockurl/';
  });

  beforeEach(() => {
    axios.mockClear();
  });

  it('returns employee ID if a good response', async () => {
    axios.post.mockResolvedValue(mockResponseGood);

    const result = await sap.postApplicant(applicant);
    expect(result).toEqual('123456');
  });

  it('returns null if a bad response', async () => {
    axios.post.mockResolvedValue(mockResponseBad);
    const result = await sap.postApplicant(applicant);
    expect(result).toEqual(null);
  });

  it.skip('throws an exception on failure', async () => {
    axios.post.mockRejectedValue(new Error('There is an error'));
    const result = await sap.postApplicant();
    expect(result instanceof Error).toBe(true);
  });
});
