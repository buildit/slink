'use strict';

const introduction = require('./introduction');
const activation = require('./activation');
const config = require('./config');
const runDao = require('./lastrundatedao');
const timeSource = require('./timesource');


module.exports.handler = async (event, context, callback) => {
  console.info(`#### Function ARN:  ${context.invokedFunctionArn}`);

  try {
    // Load all configuration parameters from AWS SSM
    await config.loadConfigParams(context);

    const introductionResult = await introduction.process();
    const activationResult = await activation.process();

    await writeRunRecord(context);

    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: `Sent ${introductionResult.successful} candidate(s) to SAP, failed: ${introductionResult.unsuccessful}. ` +
                 `Activated ${activationResult.successful} candidate(s) in SAP, ` +
                   `failed to activate: ${activationResult.unsuccessful}`
      })
    };
    callback(null, response);
  } catch (e) {
    console.error(`Error in handler:  ${e.message}`);
    callback(e, {
      statusCode: 500,
      body: { message: e.toString() }
    });
  }
};

async function writeRunRecord(context) {
  try {
    const requestId = context.awsRequestId;
    console.info(`Writing last run item to DynamoDb, ID: ${requestId}`);
    await runDao.write(requestId, timeSource.getSerialTime());
  } catch (e) {
    console.error('Error writing last run item to DynamoDb unsuccessful', e);
    throw e;
  }
}
