'use strict';

const axios = require('axios');

const getCandidateSummaries = async () => {
  try {
    const apiToken = process.env.SR_API_TOKEN;
    const options = {
      method: 'GET',
      headers: { 'X-SmartToken': apiToken }
    };

    const reply = await axios.get(process.env.SR_CANDIDATE_SUMMARY_URL, options);

    return reply.data.content;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const getCandidateDetail = async (candidateId) => {
  let reply;
  try {
    const apiToken = process.env.SR_API_TOKEN;
    let apiEndpoint = process.env.SR_CANDIDATE_DETAIL_URL;
    if (apiEndpoint != null) {
      apiEndpoint = apiEndpoint.replace('{candidateId}', candidateId);
    }
    const options = {
      method: 'GET',
      headers: { 'X-SmartToken': apiToken }
    };

    reply = await axios.get(apiEndpoint, options);
    return reply.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const getJobProperties = async (candidateId, jobId) => {
  let reply;
  try {
    const apiToken = process.env.SR_API_TOKEN;
    let apiEndpoint = process.env.SR_JOB_PROPS_URL;
    if (apiEndpoint != null) {
      apiEndpoint = apiEndpoint.replace('{candidateId}', candidateId);
      apiEndpoint = apiEndpoint.replace('{jobId}', jobId);
    }

    const options = {
      method: 'GET',
      headers: { 'X-SmartToken': apiToken }
    };

    reply = await axios.get(apiEndpoint, options);
    return reply.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const findPropertyValue = (props, propertyLabel) => {
  const foundProperty = props.find(property => property.label === propertyLabel);
  return (foundProperty === undefined ? null : foundProperty.value);
};

const getValue = property => (property != null ? property.value : null);
const getCode = property => (property != null ? property.code : null);

const getApplicants = async () => {
  const summaries = await getCandidateSummaries();

  const applicants = Promise.all(summaries.map(async (summary) => {
    const detail = await getCandidateDetail(summary.id);
    const jobProps = await getJobProperties(summary.id, summary.primaryAssignment.job.id);
    const salaryPropertyValue = findPropertyValue(jobProps.content, 'Annual Salary');
    const annualBonusValue = findPropertyValue(jobProps.content, 'Annual Bonus');
    const signingBonusValue = findPropertyValue(jobProps.content, 'Signing Bonus');

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
          id: summary.primaryAssignment.job.id,
          startDate: findPropertyValue(jobProps.content, 'Start Date'),
          zipCode: findPropertyValue(jobProps.content, 'Zip Code'),
          country: findPropertyValue(jobProps.content, 'Country'),
          annualSalary: getValue(salaryPropertyValue),
          offeredCurrency: getCode(salaryPropertyValue), // Assume currency is salary currency.
          annualBonus: getValue(annualBonusValue),
          signingBonus: getValue(signingBonusValue)
        }
      }
    };

    if (detail) {
      applicant.phoneNumber = detail.phoneNumber || null;
      applicant.experience = {
        location: (detail.experience && detail.experience[0].location) || null
      };
    }

    return applicant;
  }));

  return applicants;
};

module.exports = {
  getApplicants
};
