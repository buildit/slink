'use strict';

const introduction = require('./introduction');
const config = require('./config');
const runDao = require('./lastrundatedao');
const timeSource = require('./timesource');


module.exports.handler = async (event, context, callback) => {
  try {
    console.info(`#### Function ARN:  ${context.invokedFunctionArn}`);

    // Load all configuration parameters from AWS SSM
    await config.loadConfigParams(context);

    const result = await introduction.process();

    console.info(`Process complete. Applicants sent to SAP in this run: ${JSON.stringify(result)}`);
    result.successfulApplicants.forEach((applicant) => {
      console.info(`${JSON.stringify(applicant)}`);
    });

    await writeRunRecord(context);

    const response = {
      statusCode: 200,
      body: JSON.stringify({ message: `Sent ${result.successful} candidate(s) to SAP, failed: ${result.unsuccessful}` })
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
