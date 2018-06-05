'use strict';

const axios = require('axios');
const smartrecruiters = require('../../smartrecruiters');
const models = require('./models');

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
    const mockSummaryResponse = { data: { content: [models.mockedRawCandidateSummary] } };
    axios.get.mockResolvedValueOnce(mockSummaryResponse);

    const mockDetailResponse = { data: models.mockedRawCandidateDetail };
    axios.get.mockResolvedValueOnce(mockDetailResponse);

    const response = await smartrecruiters.getApplicants();
    expect(response[0]).toEqual(models.mockedApplicantModel);
  });

  it.skip('should return an error on failure', async () => {
    // Don't set up mocks, which results `undefined` values, which causes error.
    expect(() => { smartrecruiters.getApplicants() }).toThrow();
  });
});
