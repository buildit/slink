'use strict';

const getType = require('jest-get-type');
const index = require('../../index.js');
const smartrecruiters = require('../../smartrecruiters');

jest.mock('../../smartrecruiters');
let event;
let context;

describe('Tests index', () => {
  it('verifies mock successful response', async () => {
    smartrecruiters.setWillReturnSuccessResult(true);
    await index.handler(event, context, (err, result) => {
      expect(result.statusCode).toEqual(200);
      expect(getType(result.body)).toEqual('string');
    });
  });
  it('verifies mock failed response', async () => {
    smartrecruiters.setWillReturnSuccessResult(false);
    await index.handler(event, context, (err, result) => {
      expect(result.statusCode).toEqual(500);
      expect(getType(result.body)).toEqual('object');
    });
  });
});

