'use strict'

const timesource = require('../../timesource');

describe('Testing timesource', () => {
  it('Should have zero difference', () => {
    var t1 = Math.round(timesource.getSerialTime() / 1000);
    var t2 = Math.round(timesource.getSerialTime() / 1000);
    expect(t2 - t1).toEqual(0);
  })
})
