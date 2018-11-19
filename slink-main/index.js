'use strict';

const log = require('./log');
const {
  LOG_INFO,
  LOG_ERROR
} = require('./constants');

const introduction = require('./introduction');
const activation = require('./activation');
const config = require('./config');
const lastRunDateDao = require('./dao/lastrundatedao');
const runsDao = require('./dao/runsdao');
const timeSource = require('./timesource');


module.exports.handler = async (event, context, callback) => {
  log(LOG_INFO, `#### Function ARN:  ${context.invokedFunctionArn}`);
  log(LOG_INFO, `#### Request ID:  ${context.awsRequestId}`);

  const serialTime = timeSource.getSerialTime();

  try {
    await config.loadConfigParams(context);

    const introductionResult = await introduction.process();
    const activationResult = await activation.process();


    const response = {
      statusCode: 200,
      body: {
        introductionResult,
        activationResult,
        message: `Candidate(s) introduced to SAP: ${introductionResult.successful}, failed: ${introductionResult.unsuccessful}. ` +
                `Candidate(s) activated in SAP: ${activationResult.successful}, failed: ${activationResult.unsuccessful}.`
      }
    };

    await writeLastRunDateRecord(context, serialTime);
    await writeRunRecord(context, serialTime, response);

    callback(null, response);
  } catch (e) {
    console.error(`Error in handler:  ${e.message}`);
    const response = {
      statusCode: 500,
      body: { message: e.toString() }
    };

    await writeLastRunDateRecord(context, serialTime);
    await writeRunRecord(context, serialTime, response);

    callback(e, response);
  }
};

async function writeLastRunDateRecord(context, serialDateTime) {
  try {
    const requestId = context.awsRequestId;
    log(LOG_INFO, 'Writing last run date item to DynamoDb, requestId:', requestId);
    await lastRunDateDao.write(requestId, serialDateTime);
  } catch (e) {
    console.error('Error writing last run date item to DynamoDb', e);
    throw e;
  }
}

async function writeRunRecord(context, serialDateTime, response) {
  try {
    const requestId = context.awsRequestId;
    log(LOG_INFO, 'Writing run item to DynamoDb, requestId:', requestId);
    await runsDao.write(requestId, serialDateTime, response);
  } catch (e) {
    log(LOG_ERROR, 'Error writing run item to DynamoDb', e);
    throw e;
  }
}
