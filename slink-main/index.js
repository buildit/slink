'use strict';

const introduction = require('./introduction');
const activation = require('./activation');
const config = require('./config');
const runDao = require('./lastrundatedao');
const timeSource = require('./timesource');


module.exports.handler = async (event, context, callback) => {
  console.info(`#### Function ARN:  ${context.invokedFunctionArn}`);

  try {
    await config.loadConfigParams(context);

    const introductionResult = await introduction.process();
    const activationResult = await activation.process();

    await writeRunRecord(context);

    const response = {
      statusCode: 200,
      body: {
        introductionResult,
        activationResult,
        message: `Candidate(s) introduced to SAP: ${introductionResult.successful}, failed: ${introductionResult.unsuccessful}. ` +
                `Candidate(s) activated in SAP: ${activationResult.successful}, failed: ${activationResult.unsuccessful}.`
      }
    };
    console.info('Writing response:');
    console.dir(response, { depth: null });
    callback(null, response);
  } catch (e) {
    console.error(`Error in handler:  ${e.message}`);
    callback(e, {
      statusCode: 500,
      body: { message: e.toString() }
    });
  }
};


// async function getLastRunDateIso() {
//   const lastRunDateObj = await runDao.read();
//
//   if (lastRunDateObj.Item && lastRunDateObj.Item.runSerialDate) {
//     const runSerialDate = lastRunDateObj.Item.runSerialDate.N;
//     return new Date(Number(runSerialDate)).toISOString();
//   }
//   console.info('Last run date not found. Defaulting to today\'s date');
//   return new Date().toISOString();
// }

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
