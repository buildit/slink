'use strict';

const log = require('../log');
const {
  LOG_ERROR,
  SAP_BACKEND_TIMEOUT_THRESHOLD,
  SAP_BACKEND_DOWN_EXCEPTION
} = require('../constants');

const axios = require('axios');
const config = require('../config');

async function checkStatus() {
  const currentTimestamp = Date.now();
  try {
    const apiEndPoint = config.params.SAP_ADD_EMPLOYEE_URL.value;
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const response = await axios.get(apiEndPoint, options);
    if (response.status !== 200) {
      throw new Error(SAP_BACKEND_DOWN_EXCEPTION);
    } else if (response.status === 200) {
      const responseTime = Date.now() - currentTimestamp;
      if (responseTime > SAP_BACKEND_TIMEOUT_THRESHOLD) {
        throw new Error(SAP_BACKEND_DOWN_EXCEPTION);
      }
    } else {
      throw new Error(SAP_BACKEND_DOWN_EXCEPTION);
    }
    return true;
  } catch (err) {
    log(LOG_ERROR, `Exception occured while checking the backend status: ${err.message}`, err);
    throw err;
  }
}

module.exports = checkStatus;
