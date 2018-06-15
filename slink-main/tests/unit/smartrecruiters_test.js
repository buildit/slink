'use strict';

const axios = require('axios');
const smartrecruiters = require('../../smartrecruiters');
const testmodels = require('./models');

jest.mock('axios');


describe('Get candidate summary', () => {
  const mockSummaryResponse = testmodels.sr.rawCandidateSummaries;
  const { get } = axios;

  beforeAll(() => {
    process.env.SR_API_TOKEN = 'SR_API_TOKEN';
    process.env.SR_CANDIDATE_SUMMARY_URL = 'http://mockurl/';
    process.env.SR_JOB_PROPS_URL = 'https://api.smartrecruiters.com/candidates/{candidateId}/jobs/{jobId}/properties';
  });

  beforeEach(() => {
    axios.mockClear();
  });

  it('should build applicant if required data is present', async () => {

    get.mockResolvedValueOnce(mockSummaryResponse);
    get.mockResolvedValueOnce(testmodels.sr.candidateDetail);
    get.mockResolvedValueOnce(testmodels.sr.jobDetail);
    get.mockResolvedValueOnce(testmodels.sr.jobProperties);

    const response = await smartrecruiters.getApplicants();

    expect(get.mock.calls[0][0]).toBe(process.env.SR_CANDIDATE_SUMMARY_URL);
    expect(get.mock.calls[1][0]).toBe(testmodels.sr.rawCandidateSummaries.data.content[0].actions.details.url);
    expect(get.mock.calls[2][0]).toBe(testmodels.sr.candidateDetail.data.primaryAssignment.job.actions.details.url);
    expect(get.mock.calls[3][0]).toBe('https://api.smartrecruiters.com/candidates/cc285818-963d-497a-a2a8-e2227af0876e/jobs/ccfc86f3-c309-48e2-a2ae-175ae0d0ec3c/properties');

    expect(response[0]).toEqual(testmodels.applicant);
  });


  it('should build applicant employee ID if property is present', async () => {
    get.mockResolvedValueOnce(mockSummaryResponse);
    get.mockResolvedValueOnce(testmodels.sr.candidateDetail);
    get.mockResolvedValueOnce(testmodels.sr.jobDetail);

    const jobPropertiesWithEmployeeId = Object.assign({}, testmodels.sr.jobProperties);
    jobPropertiesWithEmployeeId.data.content.push({
      id: 'abc321',
      label: 'Employee ID',
      value: 12345
    });
    get.mockResolvedValueOnce(jobPropertiesWithEmployeeId);

    const response = await smartrecruiters.getApplicants();

    expect(get.mock.calls[0][0]).toBe(process.env.SR_CANDIDATE_SUMMARY_URL);
    expect(get.mock.calls[1][0]).toBe(testmodels.sr.rawCandidateSummaries.data.content[0].actions.details.url);
    expect(get.mock.calls[2][0]).toBe(testmodels.sr.candidateDetail.data.primaryAssignment.job.actions.details.url);
    expect(get.mock.calls[3][0]).toBe('https://api.smartrecruiters.com/candidates/cc285818-963d-497a-a2a8-e2227af0876e/jobs/ccfc86f3-c309-48e2-a2ae-175ae0d0ec3c/properties');

    const expectedApplicant = Object.assign({}, testmodels.applicant);
    expectedApplicant.employeeId = 12345;
    expect(response[0]).toEqual(expectedApplicant);
  });

  it.skip('should return an error on failure', async () => {
    // Don't set up mocks, which results `undefined` values, which causes error.
    expect(() => {
      smartrecruiters.getApplicants();
    }).toThrow();
  });
});
