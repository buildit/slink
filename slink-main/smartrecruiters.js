'use strict';

const axios = require('axios');

const getCandidateSummaries = async () => {
  try {
    const apiToken = process.env.SR_API_TOKEN;
    const options = {
      method: 'GET',
      headers: { 'X-SmartToken': apiToken },
      url: process.env.SR_CANDIDATE_SUMMARY_URL
    };

    const result = await axios.get(options);

    return result.data.content;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const getCandidateDetail = async (candidateId) => {
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
    return reply.data.content;
  } catch (err) {
    console.log(err);
    throw err;
  }
};


const getApplicants = async () => {
  const summaries = await getCandidateSummaries();

  return Promise.all(summaries.map(async (summary) => {
    const detail = await getCandidateDetail(summary.id);

    const applicant = {
      id: summary.id,
      firstName: summary.firstName,
      lastName: summary.lastName,
      email: summary.email,
      location: {
        country: summary.location.country || null,
        city: summary.location.city || null
      },
      primaryAssignment: {
        job: {
          id: summary.primaryAssignment.job.id
        }
      }
    };

    if (detail[0]) {
      applicant.phoneNumber = detail[0].phoneNumber || null;
      applicant.experience = {
        location: (detail[0].experience[0].location) || null
      };
    }

    return applicant;
  }));
};

module.exports = {
  getApplicants
};
