'use strict';

const awsParamStore = require('aws-param-store');

/**
 * Helper function to call AWS API to retrieve parameter values
 * Extracting this call in its own function also helps in mocking tests
 * @param paramPath
 * @param awsRegion
 * @returns Parameter keys/values raw JSON
 */
const getParams = async (paramPath, awsRegion) => awsParamStore.getParametersByPath(paramPath, { region: awsRegion });

module.exports = {
  getParams
};
