'use strict';

const axios = require('axios');
const sapAddEmployee = require('../../../sap/addemployee');
const config = require('../../../config');
const testmodels = require('../models');

jest.mock('axios');

// Not sure about ReturnFlag value for a good response.  Below is just a guess for now.
const mockResponseGood = {
  data: {
    output: {
      ReturnFlag: 'T',
      ReturnMessage: 'some return message',
      EmployeeId: '123456'
    }
  }
};

const mockResponseBad = {
  data: {
    output: {
      ReturnFlag: 'F',
      ReturnMessage: 'some return message',
      EmployeeId: '0'
    }
  }
};

const mockStupidResponseButHasActuallyHappened = {
  data: {
    output: {}
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

  it('returns employee ID if a good response', async () => {
    axios.post.mockResolvedValue(mockResponseGood);

    const result = await sapAddEmployee.execute(testmodels.applicant, 111);
    expect(result).toEqual('123456');
  });

  it('returns null if a bad response', async () => {
    axios.post.mockResolvedValue(mockResponseBad);
    const result = await sapAddEmployee.execute(testmodels.applicant, 111);
    expect(result).toEqual(null);
  });

  it('returns null if an empty/indeterminate response', async () => {
    axios.post.mockResolvedValue(mockStupidResponseButHasActuallyHappened);
    const result = await sapAddEmployee.execute(testmodels.applicant, 111);
    expect(result).toEqual(null);
  });

  it('throws an exception on failure', () => {
    const error = new Error('Error from unit test (addemployee_test)');
    axios.post.mockRejectedValue(error);
    return expect(sapAddEmployee.execute(testmodels.applicant, 111)).rejects.toBe(error);
  });
});


describe('Building an execute() post body', () => {
  it('with normal applicant results in a POSTable object', () => {
    const applicantWithProperties = testmodels.applicant;
    const asOfDate = new Date(2018, 0, 5);

    const body = sapAddEmployee.buildPostBody(applicantWithProperties, 1234, asOfDate);

    const { applicantId } = body.input;
    expect(applicantId.Resume_Number).toEqual(1234);
    expect(applicantId.First_Name).toEqual(applicantWithProperties.firstName);
    expect(applicantId.Last_Name).toEqual(applicantWithProperties.lastName);
    expect(applicantId.CITY).toEqual(applicantWithProperties.location.city);
    expect(applicantId.Pin_Code).toEqual(applicantWithProperties.primaryAssignment.job.zipCode);
    expect(applicantId.Country).toEqual(applicantWithProperties.location.country);
    expect(applicantId.Contact_Number).toEqual(applicantWithProperties.phoneNumber);
    expect(applicantId.Employer_City).toEqual(applicantWithProperties.experience.location);

    const {
      // eslint-disable-next-line camelcase
      offeredCurrency, salary, Offer_Date, Joining_Date
    } = body.input.contractOffer;
    expect(offeredCurrency).toEqual(applicantWithProperties.primaryAssignment.job.offeredCurrency);
    expect(salary[0].compValue).toEqual('8333');
    expect(salary[2].compValue).toEqual(`${applicantWithProperties.primaryAssignment.job.annualBonus}`);
    expect(Offer_Date).toEqual('05-Jan-2018');
    expect(Joining_Date).toEqual('22-Jun-2018');
  });

  it('with crappy applicant results in a POSTable object', () => {
    const hackedApplicant = Object.assign({}, testmodels.applicant);
    hackedApplicant.phoneNumber = '123 456 7890';
    hackedApplicant.primaryAssignment.job.zipCode = 'ABC 123';
    hackedApplicant.location = {}; // Case from actual data
    hackedApplicant.experience.location = ', , '; // Case from actual data
    hackedApplicant.primaryAssignment.job.annualBonus = null; // Can happen with contractors
    hackedApplicant.primaryAssignment.job.offeredCurrency = null; // Can happen with contractors
    const asOfDate = new Date(2018, 0, 5);

    const body = sapAddEmployee.buildPostBody(hackedApplicant, 1234, asOfDate);

    const {
      // eslint-disable-next-line camelcase
      Contact_Number, Pin_Code, Employer_City
    } = body.input.applicantId;
    expect(Contact_Number).toEqual('1234567890');
    expect(Pin_Code).toEqual(sapAddEmployee.DEFAULT_ZIP_CODE);
    expect(Employer_City).toEqual(sapAddEmployee.MISSING_STRING);
    const qplc = body.input.contractOffer.salary.find(it => it.compCode === 'QPLC').compValue;
    expect(qplc).toEqual('0');
    expect(body.input.contractOffer.offeredCurrency).toEqual('USD');
  });

  it('with applicant with international number results in a POSTable object', () => {
    const hackedApplicant = Object.assign({}, testmodels.applicant);
    hackedApplicant.phoneNumber = '+919591875888';
    const asOfDate = new Date(2018, 0, 5);

    const body = sapAddEmployee.buildPostBody(hackedApplicant, 1234, asOfDate);

    // eslint-disable-next-line camelcase
    const { Contact_Number } = body.input.applicantId;
    expect(Contact_Number).toEqual('9591875888');
  });
});

