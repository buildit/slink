'use strict';

const introduction = require('./introduction');

module.exports.handler = async (event, context, callback) => {
  try {
    const result = await introduction.process();

    result.successfulApplicants.forEach((applicant) => {
      console.log(`Applicant introduced to SAP: ${JSON.stringify(applicant)}`);
    });

    const response = {
      statusCode: 200,
      body: JSON.stringify({ message: `Processed ${result.successfulApplicants.length} candidate(s)` })
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
