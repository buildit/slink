'use strict';

const axios = require('axios');
const smartrecruiters = require('../../smartrecruiters');
const models = require('./models');

jest.mock('axios');

describe('Tests get candidate summary', () => {
  beforeAll(() => {
    process.env.SR_API_TOKEN = 'SR_API_TOKEN';
    process.env.SR_CANDIDATE_SUMMARY_URL = 'http://mockurl/';
  });

  beforeEach(() => {
    axios.mockClear();
  });

  it('should build applicant when success', async () => {
    const mockSummaryResponse = { data: { content: [models.mockedRawCandidateSummary] } };
    axios.get.mockResolvedValueOnce(mockSummaryResponse);

    const mockDetailResponse = { data: { content: [models.mockedRawCandidateDetail] } };
    axios.get.mockResolvedValueOnce(mockDetailResponse);

    const applicants = await smartrecruiters.getApplicants();
    expect(applicants.applicants[0]).toEqual(models.mockedApplicantModel);
  });

  it('should get user summary when success', async () => {
    const mockSummaryResponse = { data: { content: [models.mockedRawCandidateSummary] } };
    axios.get.mockResolvedValue(mockSummaryResponse);
    const summaryResult = await smartrecruiters.getApplicantSummaries();
    expect(summaryResult[0]).toEqual(models.mockedApplicantSummaryModel);
  });

  it('should return an error when fail', async () => {
    expect.assertions(0);
    smartrecruiters.getApplicantSummaries().catch(e => expect(e).toThrow());
  });

  it('should get user details when success', async () => {
    const mockDetailResponse = { data: { content: [models.mockedRawCandidateDetail] } };
    axios.get.mockResolvedValue(mockDetailResponse);
    const detailsResult = await smartrecruiters.getCandidateDetails('555');
    expect(detailsResult.candidateDetails).toBeDefined();
  });

  it('should return an error when fail', async () => {
    expect.assertions(0);
    smartrecruiters.getCandidateDetails().catch(e => expect(e).toThrow());
  });
});
