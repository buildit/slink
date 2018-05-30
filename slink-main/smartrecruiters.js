'use strict';

const axios = require('axios');
const utils = require('./utils');

const getCandidateDetails = async (candidateId) => {
  let reply;
  try {
    const apiToken = process.env.SR_API_TOKEN;
    const apiEndpoint = process.env.SR_CANDIDATE_DETAIL_URL + candidateId;
    const options = {
      method: 'GET',
      headers: { 'X-SmartToken': apiToken },
      url: apiEndpoint
    };

    reply = await axios(options);

    // console.log(`reply.data: ${JSON.stringify(reply.data.id)}`);

    return {
      message: 'Candidate details found',
      candidateDetails: reply.data
    };
  }
  catch (err) {
    console.log(err);
    throw err;
  }
};


const loadCandidateDetails = async (candidatesList) => {
  const results = [];
  // Get candidate details asynchronously
  for (const candidate of candidatesList) {
    try {
      results.push(getCandidateDetails(candidate.id));
    }
    catch (err) {
      console.log(err);
      throw err;
    }
  }

  // Now wait for all calls to complete before processing results
  const detailsList = await Promise.all(results);

  return utils.processRawDetails(detailsList, candidatesList);
};


const getCandidateSummaries = async () => {
  try {
    const apiToken = process.env.SR_API_TOKEN;
    console.log(`API TOKEN: ${apiToken}`);
    const options = {
      method: 'GET',
      headers: { 'X-SmartToken': apiToken },
      url: process.env.SR_CANDIDATE_SUMMARY_URL
    };

    const result = await axios(options);

    return utils.processRawSummaries(result.data.content);
  }
  catch (err) {
    console.log(err);
    throw err;
  }
};


const getCandidates = async () => {
  try {
    const summaryList = await getCandidateSummaries();

    const list = await loadCandidateDetails(summaryList);

    // console.log(`final candidate list: ${JSON.stringify(list)}`);

    return {
      message: 'Candidates found',
      candidatesList: list
    };
  } catch (err) {
    console.log(err);
  }
  return {
    message: 'Could not retrieve candidates',
    count: 0
  };
};

module.exports = { getCandidates };
