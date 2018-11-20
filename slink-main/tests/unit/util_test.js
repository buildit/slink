'use strict';

const util = require('../../util');

describe('Utils test', () => {
  it('Generate resume number with 6-8 digit', () => {
    const number = util.generateResumeNumber();
    expect(number.toString().length === 6 ||
           number.toString().length === 7 ||
           number.toString().length === 8).toBeTruthy();
  });
});
