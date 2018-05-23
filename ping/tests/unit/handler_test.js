'use strict';
const getType = require('jest-get-type');
const index = require('../../index.js');
let event;
let context;



describe('Tests index', () => {
  it('verifies successful response', async () => {
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
});

