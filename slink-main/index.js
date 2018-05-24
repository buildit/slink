'use strict';

const sr = require('./smartrecruiters');

module.exports.handler = async (event, context, callback) => {
  const summaries = await sr.getCandidateSummaries();
  console.log(`getCandidateSummaries(): ${summaries}`);
  callback(null, summaries);
};
