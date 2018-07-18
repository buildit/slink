'use strict';

const config = require('./config');
const app = require('applicant');
const processor = require('processor');
const sr = require('smartrecruiters');
const introduction = require('introduction');
// const activation = require('activation');
// const runDao = require('./lastrundatedao');
// const timeSource = require('./timesource');


module.exports.handler = async (event, context, callback) => {
  console.info(`#### Function ARN:  ${context.invokedFunctionArn}`);

  try {
    await config.loadConfigParams(context);

    const introductionSummaries = await sr.getCandidateSummaries('OFFERED', 'Offer Accepted', 100);
    console.log('introductionSummaries:', introductionSummaries);
    const introductionResult = await processor.execute(
      introductionSummaries,
      await sr.toApplicant,
      a => (app.isFte(a) && !app.hasEmployeeId(a)),
      await introduction.introduce
    );

    // const activationSummaries = await sr.getCandidateSummaries('OFFERED', 'ONBOARDING', 100);
    // console.log('activationSummaries:', activationSummaries);
    // const activationResult = processor.execute(
    //   activationSummaries,
    //   sr.toApplicant,
    //   a => (app.isFte(a) && app.hasEmployeeId(a)),
    //   activation.activate
    // );
    const activationResult = {
      successful: 0,
      unsuccessful: 0
    };

    // await writeRunRecord(context);

    const response = {
      statusCode: 200,
      body: {
        introductionResult,
        activationResult
      }
    };
    await callback(null, response);
  } catch (e) {
    console.error(`Error in handler:  ${e.message}`);
    await callback(e, {
      statusCode: 500,
      body: { message: e.toString() }
    });
  }
};


// async function writeRunRecord(context) {
//   try {
//     const requestId = context.awsRequestId;
//     console.info(`Writing last run item to DynamoDb, ID: ${requestId}`);
//     await runDao.write(requestId, timeSource.getSerialTime());
//   } catch (e) {
//     console.error('Error writing last run item to DynamoDb unsuccessful', e);
//     throw e;
//   }
// }
