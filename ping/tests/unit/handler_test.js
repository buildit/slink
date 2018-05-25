'use strict';

const axios = require('axios');
const getType = require('jest-get-type');
const index = require('../../index.js');

jest.mock('axios');

let event;
let context;

describe('Tests index', () => {
  it('verifies successful response', async () => {
    const mockResponse = { data: { content: [{ name: 'Mock candidate' }] } };
    axios.mockResolvedValue(mockResponse);
    await index.handler(event, context, (err, result) => {
      expect(getType(result)).toEqual('object');
      expect(result.statusCode).toEqual(200);
      expect(getType(result.body)).toEqual('string');

      const response = JSON.parse(result.body);

      expect(getType(response)).toEqual('object');
      expect(response.message).toEqual('hello world');
      expect(getType(response.location)).toEqual('string');
    });
  });
  it('returns an error from failed response', async () => {
    axios.mockRejectedValue(new Error('a mock error'));
    await index.handler(event, context, (err, result) => {
      expect(result).toBeNull();
      const isError = err instanceof Error;
      expect(isError).toBe(true);
    });
  });
});

