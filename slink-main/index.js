'use strict';

const sr = require('./smartrecruiters');

module.exports.handler = async (event, context, callback) => {
  try {
    const result = await sr.getApplicants();

    const response = {
      statusCode: 200,
      body: JSON.stringify(`Processed ${result.applicants.length} candidates`),
      data: JSON.stringify(result.applicants)
    };

    callback(null, response);
  } catch (e) {
    callback(null, {
      statusCode: 500,
      body: {}
    });
  }
};
