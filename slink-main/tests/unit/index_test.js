'use strict';

const getType = require('jest-get-type');
const index = require('../../index.js');
const introduction = require('../../introduction');

jest.mock('../../introduction');
let event;
let context;

describe('When handler invoked', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods
    introduction.process.mockClear();
  });

  it('runs introduction process and gives successful response', async () => {
    introduction.process.mockResolvedValue({ successfulApplicants: [{ id: 'abc-123' }] });

    await index.handler(event, context, (err, result) => {
      expect(result.statusCode).toEqual(200);
      expect(getType(result.body)).toEqual('string');
      expect(result.body).toEqual(JSON.stringify({ message: 'Processed 1 candidate(s)' }));
    });
  });

  it('runs introduction process and gives unsuccessful response if issues', async () => {
    introduction.process.mockRejectedValue(new Error('Some random error occurred'));
    await index.handler(event, context, (err, result) => {
      expect(result.statusCode).toEqual(500);
      expect(getType(result.body)).toEqual('object');
      expect(result.body).toEqual({ message: 'Error: Some random error occurred' });
    });
  });
});

