'use strict';

const axios = require('axios');

const srGet = async (url) => {
  try {
    const apiToken = process.env.SR_API_TOKEN;
    const options = {
      method: 'GET',
      headers: { 'X-SmartToken': apiToken }
    };

    const reply = await axios.get(url, options);

    return reply.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const getJobProperties = async (candidateId, jobId) => {
  let apiEndpoint = process.env.SR_JOB_PROPS_URL;
  if (apiEndpoint != null) {
    apiEndpoint = apiEndpoint.replace('{candidateId}', candidateId);
    apiEndpoint = apiEndpoint.replace('{jobId}', jobId);
  }
  return srGet(apiEndpoint);
};

const findPropertyValue = (props, propertyLabel) => {
  if (!props) return null;

  const foundProperty = props.find(property => property.label === propertyLabel);
  return (foundProperty === undefined ? null : foundProperty.value);
};

const getValue = property => (property != null ? property.value : null);
const getCode = property => (property != null ? property.code : null);

const getApplicants = async () => {
  const summaries = await srGet(process.env.SR_CANDIDATE_SUMMARY_URL);

  const applicants = Promise.all(summaries.content.map(async (summary) => {
    const candidateDetail = await srGet(summary.actions.details.url);
    const jobDetail = await srGet(candidateDetail.primaryAssignment.job.actions.details.url);
    const jobProps = await getJobProperties(summary.id, summary.primaryAssignment.job.id);
    const salaryPropertyValue = findPropertyValue(jobProps.content, 'Annual Salary');
    const annualBonusValue = findPropertyValue(jobProps.content, 'Annual Bonus');
    const signingBonusValue = findPropertyValue(jobProps.content, 'Signing Bonus');
    const employeeId = findPropertyValue(jobProps.content, 'Employee ID');

    const applicant = {
      id: summary.id,
      employeeId,
      firstName: summary.firstName,
      lastName: summary.lastName,
      email: summary.email,
      location: {
        country: summary.location.country || null,
        city: summary.location.city || null
      },
      fullTime: (jobDetail.typeOfEmployment && jobDetail.typeOfEmployment.id === 'permanent') || false,
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

    if (candidateDetail) {
      applicant.phoneNumber = candidateDetail.phoneNumber || null;
      applicant.experience = {
        location: (candidateDetail.experience && candidateDetail.experience[0].location) || null
      };
    }
    console.log(`'applicant', ${JSON.stringify(applicant)}`);
    return applicant;
  }));

  return applicants;
};

module.exports = {
  getApplicants
};
