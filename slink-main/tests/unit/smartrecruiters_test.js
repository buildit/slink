'use strict';

const axios = require('axios');
const smartrecruiters = require('../../smartrecruiters');

jest.mock('axios');


describe('Tests get candidate summary', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.SR_API_TOKEN = 'SR_API_TOKEN';
    process.env.SR_CANDIDATE_SUMMARY_URL = 'http://mockurl/';
  });

  it('should get user summary when sucess', async () => {
    const mockResponse = { data: { content: [{ name: 'Mock candidate' }] } };
    axios.mockResolvedValue(mockResponse);
    const result = await smartrecruiters.getCandidateSummaries();
    expect(result.count).toBeGreaterThan(0);
  });
  it('should return an error when faikl', async () => {
    axios.mockRejectedValue(new Error('There is an error'));
    const result = await smartrecruiters.getCandidateSummaries();
    const isErrorInstance = result instanceof Error;
    expect(isErrorInstance).toBe(true);
  });
});
