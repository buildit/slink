'use strict';

const introduction = require('./introduction');
const config = require('./config');
const runDao = require('./rundao');
const timeSource = require('./timesource');


module.exports.handler = async (event, context, callback) => {
  try {
    console.log(`#### context:  ${JSON.stringify(context)}`);
    console.log(`#### Function ARN:  ${context.invokedFunctionArn}`);

    // Load all configuration parameters from AWS SSM
    await config.loadConfigParams(context);

    const result = await introduction.process();

    console.log(`Process complete.  Applicants sent to SAP in this run: ${JSON.stringify(result.applicantsIntroducedToSap)}`);
    result.applicantsIntroducedToSap.forEach((applicant) => {
      console.log(`${JSON.stringify(applicant)}`);
    });

    await writeRunRecord(context);

    const response = {
      statusCode: 200,
      body: JSON.stringify({ message: `Sent ${result.applicantsIntroducedToSap.length} candidate(s) to SAP` })
    };
    callback(null, response);
  } catch (e) {
    console.log(`Error in handler:  ${e.message}`);
    callback(e, {
      statusCode: 500,
      body: { message: e.toString() }
    });
  }
};

async function writeRunRecord(context) {
  try {
    const requestId = context.awsRequestId;
    console.log(`Writing run record to Dynamo, ID: ${requestId}`);
    const serialTime = timeSource.getSerialTime();
    console.log(`'serialTime', ${JSON.stringify(serialTime)}`);
    await runDao.write(requestId, serialTime);
    console.log('Write to Dynamo successful');
  } catch (e) {
    console.log('Write to Dynamo unsuccessful', e);
    throw e;
  }
}
