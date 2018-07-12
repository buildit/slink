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

const putDynamoDbItem = async (params) => {
  const dynamoDb = createDynamoDb();
  return dynamoDb.putItem(params).promise();
};

const getDynamoDbItem = async (params) => {
  const dynamoDb = createDynamoDb();
  return dynamoDb.getItem(params).promise();
};

function createDynamoDb() {
  if (process.env.LOCAL_DYNAMO_IP === '' || process.env.LOCAL_DYNAMO_IP.length === 0) {
    return new AWS.DynamoDB();
  }

  const url = `http://${process.env.LOCAL_DYNAMO_IP}:8000`;
  console.info('NOTE:  Using local DynamoDb url:', url);
  const localEndpoint = { endpoint: new AWS.Endpoint(url) };

  return new AWS.DynamoDB(localEndpoint);
}

module.exports = {
  getParams,
  putDynamoDbItem,
  getDynamoDbItem
};
