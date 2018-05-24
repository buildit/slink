'use strict';

const sr = require('./smartrecruiters');

module.exports.handler = async (event, context, callback) => {
  try {
    const summaries = await sr.getCandidateSummaries();
    console.log(`getCandidateSummaries(): ${JSON.stringify(summaries)}`);
    const response = {
      statusCode: 200,
      body: JSON.stringify(summaries)
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
