'use strict';

const log = require('./log');
const {
  LOG_INFO,
  DYNAMO_DEFAULT_PORT
} = require('./constants');

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
  const dynamoDb = createDynamoDbDocClient();
  return dynamoDb.put(params).promise();
};

// TODO:  convert read to doc client
const getDynamoDbItem = async (params) => {
  const dynamoDb = createDynamoDb();
  return dynamoDb.getItem(params).promise();
};

function createDynamoDbDocClient() {
  if (process.env.LOCAL_DYNAMO_IP === '' || process.env.LOCAL_DYNAMO_IP.length === 0) {
    return new AWS.DynamoDB.DocumentClient();
  }
  return new AWS.DynamoDB.DocumentClient(buildLocalEndpoint());
}

function createDynamoDb() {
  if (process.env.LOCAL_DYNAMO_IP === '' || process.env.LOCAL_DYNAMO_IP.length === 0) {
    return new AWS.DynamoDB();
  }
  return new AWS.DynamoDB(buildLocalEndpoint());
}

function buildLocalEndpoint() {
  const url = `http://${process.env.LOCAL_DYNAMO_IP}:${DYNAMO_DEFAULT_PORT}`;
  log(LOG_INFO, 'NOTE:  Using local DynamoDb url:', url);
  return { endpoint: new AWS.Endpoint(url) };
}

module.exports = {
  getParams,
  putDynamoDbItem,
  getDynamoDbItem
};
