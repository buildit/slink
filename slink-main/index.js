'use strict';

const introduction = require('./introduction');
const config = require('./config');
const aws = require('aws-sdk');

async function write(requestId) {
  const dynamodb = new aws.DynamoDB();

  const params = {
    Item: {
      requestId: {
        S: requestId
      }
    },
    TableName: process.env.INTRODUCTION_EXECUTION_TABLE
  };
  await dynamodb.putItem(params).promise();
}

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

    console.log(`Writing invocationId to Dynamo: ${context.awsRequestId}`);
    try {
      await write(context.awsRequestId);
    } catch (e) {
      console.log('Write to Dynamo unsuccessful', e);
    }
    console.log('Write to Dynamo successful');

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
