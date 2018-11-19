'use strict';

const {
  LOG_INFO,
  LOG_DEBUG,
  LOG_ERROR,
  LOG_WARN
} = require('./constants');

/**
 * Function for writing log to console
 * @param level A string describes level of log
 * @param msg A string which contains log message
 * @return { null }
 */
function log(level, ...msg) {
  if (level === LOG_INFO) {
    console.info(...msg);
  } else if (level === LOG_DEBUG) {
    console.debug(...msg);
  } else if (level === LOG_ERROR) {
    console.error(...msg);
  } else if (level === LOG_WARN) {
    console.warn(...msg);
  }
}

module.exports = log;
