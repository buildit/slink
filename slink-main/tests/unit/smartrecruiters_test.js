'use strict';

const axios = require('axios');
const smartrecruiters = require('../../smartrecruiters');
const testmodels = require('./models');
const config = require('../../config');

jest.mock('axios');


describe('Get candidate summary', () => {
  const mockSummaryResponse = testmodels.sr.rawCandidateSummaries;
  const { get } = axios;

  beforeAll(() => {
    config.params.SR_SUMMARY_URL = 'http://mockurl/';
    config.params.SR_JOB_PROPS_URL = 'https://api.smartrecruiters.com/candidates/{candidateId}/jobs/{jobId}/properties';
    config.params.SR_EMPLOYEE_PROP_ID = 'abc-123';
  });

  beforeEach(() => {
    axios.mockClear();

    get.mockResolvedValueOnce(mockSummaryResponse);
    get.mockResolvedValueOnce(testmodels.sr.candidateDetail);
    get.mockResolvedValueOnce(testmodels.sr.jobDetail);

  });

  it('builds applicant if required data is present', async () => {
    get.mockResolvedValueOnce(testmodels.sr.jobProperties);

    const response = await smartrecruiters.getApplicants();

    expectSmartRecruitersCalls(get);
    expect(response[0]).toEqual(testmodels.applicant);
  });


  it('builds applicant employee ID if property is present', async () => {
    const jobPropertiesWithEmployeeId = Object.assign({}, testmodels.sr.jobProperties);
    jobPropertiesWithEmployeeId.data.content.push({
      id: config.params.SR_EMPLOYEE_PROP_ID,
      value: 12345
    });
    get.mockResolvedValueOnce(jobPropertiesWithEmployeeId);

    const response = await smartrecruiters.getApplicants();

    expectSmartRecruitersCalls(get);
    const applicantWithEmployeeId = Object.assign({}, testmodels.applicant);
    applicantWithEmployeeId.employeeId = 12345;
    expect(response[0]).toEqual(applicantWithEmployeeId);
  });


  it('throws an exception on failure', () => {
    const error = new Error('Error from unit test');
    get.mockRejectedValue(error);
    return expect(smartrecruiters.getApplicants()).rejects.toBe(error);
  });


  function expectSmartRecruitersCalls(get) {
    expect(get.mock.calls[0][0])
      .toBe(config.params.SR_SUMMARY_URL);
    expect(get.mock.calls[1][0])
      .toBe(testmodels.sr.rawCandidateSummaries.data.content[0].actions.details.url);
    expect(get.mock.calls[2][0])
      .toBe(testmodels.sr.candidateDetail.data.primaryAssignment.job.actions.details.url);
    expect(get.mock.calls[3][0])
      .toBe('https://api.smartrecruiters.com/candidates/cc285818-963d-497a-a2a8-e2227af0876e/jobs/ccfc86f3-c309-48e2-a2ae-175ae0d0ec3c/properties');
  }
});

describe('Add Employee Id property to SR', () => {

  const mockPutResponseGood = {
    status: 204
  };

  const mockPutResponseBad = {
    status: 404,
    data: {
      message: 'some return message',
      errors: [{
        code: 'some code',
        message: 'some return message'
      }]
    }
  };

  beforeAll(() => {
    config.params.SR_ADD_PROP_URL = 'http://mockurl/';
  });

  beforeEach(() => {
    axios.mockClear();
  });

  it('returns null if a good response', async () => {
    axios.put.mockResolvedValue(mockPutResponseGood);

    const result = await smartrecruiters.addEmployeeId(
      testmodels.applicant.id,
      testmodels.applicant.primaryAssignment.job.id,
      '123123g3-3434'
    );
    expect(result).toBe(true);
  });


  it('returns 404 response and body if a bad response', async () => {
    axios.put.mockResolvedValue(mockPutResponseBad);
    const result = await smartrecruiters.addEmployeeId(
      testmodels.applicant.id,
      testmodels.applicant.primaryAssignment.job.id
    );
    expect(result).toBe(false);
  });

  it('throws an exception on failure', () => {
    const error = new Error('Error from unit test');
    axios.put.mockRejectedValue(error);
    return expect(smartrecruiters.addEmployeeId(
      testmodels.applicant.id,
      testmodels.applicant.primaryAssignment.job.id
    )).rejects.toBe(error);
  });
});

