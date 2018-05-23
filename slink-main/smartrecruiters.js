'use strict';

const axios = require('axios');

const getCandidateSummaries = async () => {
  let reply;
  try {
    const apiToken = process.env.SR_API_TOKEN;
    console.log(`API TOKEN: ${apiToken}`);
    const options = {
      method: 'GET',
      headers: { 'X-SmartToken': apiToken },
      url: process.env.SR_CANDIDATE_SUMMARY_URL
    };

    reply = await axios(options);

    return {
      message: 'Candidates found',
      count: reply.data.content.length
    };
  }
  catch (err) {
    console.log(err);
  }
  return {
    message: 'Candidates found',
    count: reply.data.content.length
  };
};

module.exports = { getCandidateSummaries };
