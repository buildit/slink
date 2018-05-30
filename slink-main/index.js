'use strict';

const sr = require('./smartrecruiters');

module.exports.handler = async (event, context, callback) => {
  try {
    const result = await sr.getCandidates();

    const response = {
      statusCode: 200,
      body: JSON.stringify(`Processed ${result.candidatesList.length} candidates`),
      data: JSON.stringify(result.candidatesList)
    };

    callback(null, response);
  }
  catch (e) {
    callback(null, {
      statusCode: 500,
      body: {}
    });
  }
};
