'use strict';

const axios = require('axios');
const smartrecruiters = require('../../smartrecruiters');
const candidateModel = require('./model');

jest.mock('axios');

describe('Tests get candidate summary', () => {
  beforeAll(() => {
    process.env.SR_API_TOKEN = 'SR_API_TOKEN';
    process.env.SR_CANDIDATE_SUMMARY_URL = 'http://mockurl/';
  });

  beforeEach(() => {
    axios.mockClear();
  });

  it('should get user summary when success', async () => {
    const mockSummaryResponse = { data: { content: [candidateModel.mockedCandidateSummary] } };
    axios.mockResolvedValue(mockSummaryResponse);
    const summaryResult = await smartrecruiters.getCandidateSummaries();
    // console.log(`summaryResult:  ${JSON.stringify(summaryResult)}`);
    expect(summaryResult[0]).toEqual(candidateModel.mockedApplicantSummaryModel);
  });

  it('should return an error when fail', async () => {
    expect.assertions(0);
    smartrecruiters.getCandidateSummaries().catch(e => expect(e).toThrow());
  });

  it('should get user details when success', async () => {
    const mockDetailResponse = { data: { content: [candidateModel.mockedCandidateDetails] } };
    axios.mockResolvedValue(mockDetailResponse);
    const detailsResult = await smartrecruiters.getCandidateDetails('555');
    // console.log(`detailsResult:  ${JSON.stringify(detailsResult)}`);
    expect(detailsResult.candidateDetails).toBeDefined();
  });

  it('should return an error when fail', async () => {
    expect.assertions(0);
    smartrecruiters.getCandidateDetails().catch(e => expect(e).toThrow());
  });
});
