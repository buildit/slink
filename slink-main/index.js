'use strict';

const sr = require('./smartrecruiters');

module.exports.handler = async (event, context, callback) => {
  try {
    const result = await sr.getApplicants();
    result.forEach((applicant) => {
      console.log(`Applicant created: ${applicant.id}, ${applicant.lastName}, ${applicant.firstName}`);
    });

    const response = {
      statusCode: 200,
      body: JSON.stringify({ message: `Processed ${result.length} candidate(s)` })
    };
    callback(null, response);
  } catch (e) {
    callback(e, {
      statusCode: 500,
      body: { message: e.toString() }
    });
  }
};
