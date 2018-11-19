'use strict';

const util = require('../../util');

describe('Utils test', () => {
  it('Generate resume number with 8 digit', () => {
    const number = util.generateResumeNumber();
    expect(number.toString().length).toEqual(8);
  });
});
