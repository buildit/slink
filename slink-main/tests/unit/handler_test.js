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
    smartrecruiters.getApplicants.mockResolvedValue([{id: 'abc-123'}]);

    await index.handler(event, context, (err, result) => {
      expect(result.statusCode).toBe(200);
      expect(getType(result.body)).toEqual('object');
    });
  });

  it('verifies failed response', async () => {
    smartrecruiters.getApplicants.mockRejectedValue(new Error('Some random error occurred'));
    await index.handler(event, context, (err, result) => {
      expect(result.statusCode).toEqual(500);
      expect(getType(result.body)).toEqual('object');
      expect(result.body).toEqual({ message: 'Error: Some random error occurred' });
    });
  });
});

