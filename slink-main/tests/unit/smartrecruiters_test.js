'use strict';

const axios = require('axios');
const smartrecruiters = require('../../smartrecruiters');
const testmodels = require('./models');

jest.mock('axios');

describe('Get candidate summary', () => {
  beforeAll(() => {
    process.env.SR_API_TOKEN = 'SR_API_TOKEN';
    process.env.SR_CANDIDATE_SUMMARY_URL = 'http://mockurl/';
  });

  beforeEach(() => {
    axios.mockClear();
  });

  it('should build applicant if required data is present', async () => {
    const mockSummaryResponse = { data: { content: [testmodels.sr.rawCandidateSummaries] } };
    axios.get.mockResolvedValueOnce(mockSummaryResponse);

    const mockDetailResponse = { data: testmodels.sr.candidateDetail };
    axios.get.mockResolvedValueOnce(mockDetailResponse);

    const mockJobPropsResponse = { data: testmodels.sr.jobProperties };
    axios.get.mockResolvedValueOnce(mockJobPropsResponse);

    const response = await smartrecruiters.getApplicants();
    expect(response[0]).toEqual(testmodels.applicant);
  });

  it.skip('should return an error on failure', async () => {
    // Don't set up mocks, which results `undefined` values, which causes error.
    expect(() => { smartrecruiters.getApplicants() }).toThrow();
  });
});
