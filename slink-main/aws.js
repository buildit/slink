'use strict';

const awsParamStore = require('aws-param-store');
const AWS = require('aws-sdk');

/**
 * Helper function to call AWS API to retrieve parameter values
 * Extracting this call in its own function also helps in mocking tests
 * @param paramPath
 * @param awsRegion
 * @returns Parameter keys/values raw JSON
 */
const getParams = async (paramPath, awsRegion) => awsParamStore.getParametersByPath(paramPath, { region: awsRegion });

const putDynamoDb = async (params) => {
  const dynamoDb = new AWS.DynamoDB();
  return dynamoDb.putItem(params).promise();
};

module.exports = {
  getParams,
  putDynamoDb
};
