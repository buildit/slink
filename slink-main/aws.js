'use strict';

const awsParamStore = require('aws-param-store');

/**
 * Helper function to call AWS API to retrieve parameter values
 * Extracting this call in its own function also helps in mocking tests
 * @param paramPath
 * @returns Parameter keys/values raw JSON
 */
const getParams = async (paramPath, awsRegion) => {
  const parameters = await awsParamStore.getParametersByPath(paramPath, { region: awsRegion });
  return parameters;
};

module.exports = {
  getParams
};
