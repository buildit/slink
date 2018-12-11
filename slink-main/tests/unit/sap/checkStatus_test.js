'use strict';

const axios = require('axios');
const checkStatus = require('../../../sap/checkStatus');
const config = require('../../../config');
const {
  SAP_BACKEND_DOWN_EXCEPTION
} = require('../../../constants');

jest.mock('axios');

const mockResponseGood = {
  status: 200
};

const mockResponseBad = {
  status: 500
};

const mockResponseTimeout = function fx() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: 200 });
    }, SAP_BACKEND_DOWN_EXCEPTION + 1);
  });
};


describe('checkStatus', () => {
  beforeAll(() => {
    config.params.SAP_ADD_EMPLOYEE_URL.value = 'http://mockurl/';
  });

  beforeEach(() => {
    axios.mockClear();
  });

  it('returns true if backend response properly', async () => {
    axios.get.mockResolvedValue(mockResponseGood);
    const result = await checkStatus();
    expect(result).toEqual(true);
  });

  it('Throws exception when server responds with 500', async () => {
    axios.get.mockResolvedValue(mockResponseBad);
    try {
      await checkStatus();
    } catch (err) {
      expect(err.message).toEqual(SAP_BACKEND_DOWN_EXCEPTION);
    }
  });

  it('Throws exception when server not responds within threshold time', async () => {
    axios.get.mockImplementation(mockResponseTimeout);
    try {
      await checkStatus();
    } catch (err) {
      expect(err.message).toEqual(SAP_BACKEND_DOWN_EXCEPTION);
    }
  });
});

