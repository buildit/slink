'use strict';

const axios = require('axios');
const sapActivateEmployee = require('../../../sap/activateemployee');
const config = require('../../../config');
const testmodels = require('../models');

jest.mock('axios');

// Not sure about ReturnFlag value for a good response.  Below is just a guess for now.
const mockResponseGood = {
  data: {
    output: {
      Response: 'SUCCESS',
      Reason: 'Successfully Activated the Resume Number  : 7428494'
    }
  }
};

// Some liberties taken here since failure response is not defined in the docs
const mockResponseBad = {
  data: {
    output: {
      Response: 'NOT SUCCESS',
      Reason: 'Something bad happened and you lose'
    }
  }
};


describe('execute()', () => {
  beforeAll(() => {
    config.params.SAP_USERNAME.value = 'username';
    config.params.SAP_PASSWORD.value = 'password';
    config.params.SR_SUMMARY_URL.value = 'http://mockurl/';
  });

  beforeEach(() => {
    axios.mockClear();
  });

  it('returns resume number if a good response', async () => {
    axios.post.mockResolvedValue(mockResponseGood);

    const result = await sapActivateEmployee.execute(testmodels.applicant);
    expect(result).toEqual(true);
  });

  it('returns null if a bad response', async () => {
    axios.post.mockResolvedValue(mockResponseBad);
    const result = await sapActivateEmployee.execute(testmodels.applicant);
    expect(result).toEqual(false);
  });

  it('throws an exception on failure', () => {
    const error = new Error('Error from unit test (activateemployee_test)');
    axios.post.mockRejectedValue(error);
    return expect(sapActivateEmployee.execute(testmodels.applicant)).rejects.toBe(error);
  });
});


describe('Building an execute() post body', () => {
  it('with normal applicant results in a POSTable object', () => {
    const applicantWithProperties = Object.assign({}, testmodels.applicant);
    applicantWithProperties.employeeId = '1234';

    const body = sapActivateEmployee.buildPostBody(applicantWithProperties);

    const { inputs } = body;
    expect(inputs.EmployeeNumber).toEqual('1234');
    expect(inputs.ChangedBy).toEqual('00001197');
    expect(inputs.DOJ).toEqual('06-22-2018');
    expect(inputs.Action).toEqual('ACTIVE');
    expect(inputs.Comments).toEqual('');
    expect(inputs.Company).toEqual('WT');
    expect(inputs.External_AppId).toEqual('SR');
  });
});

