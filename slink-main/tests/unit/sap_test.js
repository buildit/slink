'use strict';

const axios = require('axios');
const sap = require('../../sap');
const testmodels = require('./models');

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

    const result = await sap.postApplicant(testmodels.applicant);
    expect(result).toEqual('123456');
  });

  it('returns null if a bad response', async () => {
    axios.post.mockResolvedValue(mockResponseBad);
    const result = await sap.postApplicant(testmodels.applicant);
    expect(result).toEqual(null);
  });

  it('throws an exception on failure', () => {
    const error = new Error('Error from unit test');
    axios.post.mockRejectedValue(error);
    return expect(sap.postApplicant(testmodels.applicant)).rejects.toBe(error);
  });
});


describe('Build an SAP post body', () => {
  it('results in a POSTable object', () => {
    const applicantWithProperties = testmodels.applicant;
    const asOfDate = new Date(2018, 0, 5);
    const body = sap.buildPostBody(applicantWithProperties, 1234, asOfDate);

    const applicantId = body.input.applicantId;
    expect(applicantId.Resume_Number).toEqual(1234);
    expect(applicantId.First_Name).toEqual(applicantWithProperties.firstName);
    expect(applicantId.Last_Name).toEqual(applicantWithProperties.lastName);
    expect(applicantId.CITY).toEqual(applicantWithProperties.location.city);
    expect(applicantId.Pin_Code).toEqual(applicantWithProperties.primaryAssignment.job.zipCode);
    expect(applicantId.Country).toEqual(applicantWithProperties.location.country);
    expect(applicantId.Contact_Number).toEqual(applicantWithProperties.phoneNumber);
    expect(applicantId.Employer_City).toEqual(applicantWithProperties.experience.location);

    const contractOffer = body.input.contractOffer;
    expect(contractOffer.offeredCurrency).toEqual(applicantWithProperties.primaryAssignment.job.offeredCurrency);
    console.log('salary', applicantWithProperties.primaryAssignment.job.monthlySalary);
    expect(contractOffer.salary[0].compValue).toEqual('6250');
    expect(contractOffer.salary[2].compValue).toEqual(applicantWithProperties.primaryAssignment.job.annualBonus);
    expect(contractOffer.Offer_Date).toEqual('05-Jan-2018');
    expect(contractOffer.Joining_Date).toEqual('25-Jun-2018');
  });
});

