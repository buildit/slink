'use strict';

const axios = require('axios');
const smartrecruiters = require('../../smartrecruiters');
const testmodels = require('./models');

jest.mock('axios');

describe('Get candidate summary', () => {
  beforeAll(() => {
    process.env.SR_API_TOKEN = 'SR_API_TOKEN';
    process.env.SR_CANDIDATE_SUMMARY_URL = 'http://mockurl/';
    process.env.SR_JOB_PROPS_URL = 'https://api.smartrecruiters.com/candidates/{candidateId}/jobs/{jobId}/properties';
  });

  beforeEach(() => {
    axios.mockClear();
  });

  it('should build applicant if required data is present', async () => {
    const mockSummaryResponse = testmodels.sr.rawCandidateSummaries;
    const { get } = axios;

    get.mockResolvedValueOnce(mockSummaryResponse);

    const mockDetailResponse = testmodels.sr.candidateDetail;
    get.mockResolvedValueOnce(mockDetailResponse);

    const mockJobDetailResponse = testmodels.sr.jobDetail;
    get.mockResolvedValueOnce(mockJobDetailResponse);

    const mockJobPropsResponse = testmodels.sr.jobProperties;
    get.mockResolvedValueOnce(mockJobPropsResponse);

    const response = await smartrecruiters.getApplicants();

    expect(get.mock.calls[0][0]).toBe(process.env.SR_CANDIDATE_SUMMARY_URL);
    expect(get.mock.calls[1][0]).toBe(testmodels.sr.rawCandidateSummaries.data.content[0].actions.details.url);
    expect(get.mock.calls[2][0]).toBe(testmodels.sr.candidateDetail.data.primaryAssignment.job.actions.details.url);
    expect(get.mock.calls[3][0]).toBe('https://api.smartrecruiters.com/candidates/cc285818-963d-497a-a2a8-e2227af0876e/jobs/ccfc86f3-c309-48e2-a2ae-175ae0d0ec3c/properties');

    expect(response[0]).toEqual(testmodels.applicant);
  });

  it.skip('should return an error on failure', async () => {
    // Don't set up mocks, which results `undefined` values, which causes error.
    expect(() => {
      smartrecruiters.getApplicants();
    }).toThrow();
  });
});

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

describe('Add Employee Id property to SR', () => {
  beforeAll(() => {
    process.env.SR_ADD_PROPERTY_URL = 'http://mockurl/';
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


  it('returns mockPutResponseBad if a bad response', async () => {
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
