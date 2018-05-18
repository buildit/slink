'use strict';

const index = require('../../index.js');
const chai = require('chai');

const { expect } = chai;
let event;
let context;


describe('Tests index', () => {
  it('verifies successful response', async () => {
    await index.handler(event, context, (err, result) => {
      expect(result).to.be.an('object');
      expect(result.statusCode).to.equal(200);
      expect(result.body).to.be.an('string');

      const response = JSON.parse(result.body);

      expect(response).to.be.an('object');
      expect(response.message).to.be.equal('hello world');
      expect(response.location).to.be.an('string');
    });
  });
});

