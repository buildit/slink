'use strict';

const log = require('../../log');
const {
  LOG_INFO,
  LOG_DEBUG,
  LOG_ERROR,
  LOG_WARN
} = require('../../constants');

describe('Log test', () => {
  it('Should call console info', () => {
    const spy = jest.spyOn(global.console, 'info');
    log(LOG_INFO, '');
    expect(spy).toHaveBeenCalledWith('');
  });

  it('Should call console debug', () => {
    const spy = jest.spyOn(global.console, 'debug');
    log(LOG_DEBUG, '');
    expect(spy).toHaveBeenCalledWith('');
  });

  it('Should call console error', () => {
    const spy = jest.spyOn(global.console, 'error');
    log(LOG_ERROR, '');
    expect(spy).toHaveBeenCalledWith('');
  });

  it('Should call console warn', () => {
    const spy = jest.spyOn(global.console, 'warn');
    log(LOG_WARN, '');
    expect(spy).toHaveBeenCalledWith('');
  });
});

