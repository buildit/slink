'use strict';

const sr = require('./smartrecruiters');

module.exports.handler = async (event, context, callback) => {
  const summaries = await sr.getCandidateSummaries();
  callback(null, summaries);
};
