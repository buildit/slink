'use strict';

const index = require('../../index.js');

let event;
let context;

describe.skip('Tests index', () => {
  it('verifies successful response', async () => {
    await index.handler(event, context, (err, result) => {
      expect(result.statusCode).toEqual(200);
      expect(getType(result.body)).toEqual('string');
    });
  });
});

