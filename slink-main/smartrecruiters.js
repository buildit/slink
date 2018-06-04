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

    reply = await axios.get(options);

    return {
      message: 'Candidate details found',
      candidateDetails: reply.data
    };
  } catch (err) {
    console.log(err);
    throw err;
  }
};


const loadCandidateDetails = async (candidateSummaries) => {
  const candidateDetails = [];

  // Get candidate details asynchronously
  for (const summary of candidateSummaries) {
    try {
      candidateDetails.push(getCandidateDetails(summary.id));
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  // Now wait for all calls to complete before processing details
  const resolvedCandidateDetails = await Promise.all(candidateDetails);

  return utils.processCandidateDetails(resolvedCandidateDetails, candidateSummaries);
};


const getApplicantSummaries = async () => {
  try {
    const apiToken = process.env.SR_API_TOKEN;
    const options = {
      method: 'GET',
      headers: { 'X-SmartToken': apiToken },
      url: process.env.SR_CANDIDATE_SUMMARY_URL
    };

    const result = await axios.get(options);

    return utils.createApplicantsFromSummaries(result.data.content);
  } catch (err) {
    console.log(err);
    throw err;
  }
};


const getApplicants = async () => {
  try {
    const applicantSummaries = await getApplicantSummaries();
    const applicants = await loadCandidateDetails(applicantSummaries);

    return {
      message: 'Candidates found',
      applicants
    };
  } catch (err) {
    console.log(err);
  }
  return {
    message: 'Could not retrieve candidates',
    count: 0
  };
};

module.exports = {
  getApplicants,
  getApplicantSummaries,
  getCandidateDetails
};
