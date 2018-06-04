'use strict';

const getType = require('jest-get-type');
const index = require('../../index.js');
const smartrecruiters = require('../../smartrecruiters');

jest.mock('../../smartrecruiters');
let event;
let context;

describe('Tests index', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods
    smartrecruiters.getApplicants.mockClear();
  });
  it('verifies successful response', async () => {
    const mockSuccessResult = { message: 'Candidates found', applicants: 'list' };
    smartrecruiters.getApplicants.mockResolvedValue(mockSuccessResult);
    await index.handler(event, context, (err, result) => {
      expect(result.statusCode).toEqual(200);
      expect(getType(result.body)).toEqual('string');
    });
  });
  it('verifies failed response', async () => {
    smartrecruiters.getApplicants.mockRejectedValue(new Error('Error'));
    await index.handler(event, context, (err, result) => {
      expect(result.statusCode).toEqual(500);
      expect(getType(result.body)).toEqual('object');
    });
  });
});

