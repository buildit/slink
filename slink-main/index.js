'use strict';

const introduction = require('./introduction');

module.exports.handler = async (event, context, callback) => {
  try {
    console.log(`#### Function ARN:  ${context.invokedFunctionArn}`);

    const result = await introduction.process();

    console.log(`Process complete.  Applicants in this run: ${JSON.stringify(result.processedApplicants)}`);
    result.processedApplicants.forEach((applicant) => {
      console.log(`${JSON.stringify(applicant)}`);
    });

    const response = {
      statusCode: 200,
      body: JSON.stringify({ message: `Processed ${result.processedApplicants.length} candidate(s)` })
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
