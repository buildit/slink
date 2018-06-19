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
    if (err.response) {
      console.log(`Error response from SmartRecruiters API. Status: ${err.response.status}, URL: ${url}, Headers: ${err.response.headers}, Error: ${err}`);
    } else if (err.request) {
      console.log(`Error calling SmartRecruiters API. Status: ${err.request}, Error: ${err}`);
    } else {
      console.log('Unexpected error interacting with SmartRecruiters', err.message);
    }
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

const findPropertyValueByLabel = (props, propertyLabel) => {
  if (!props) return null;

  const foundProperty = props.find(property => property.label === propertyLabel);
  return (foundProperty === undefined ? null : foundProperty.value);
};

const findPropertyValueById = (props, id) => {
  if (!props) return null;

  const foundProperty = props.find(property => property.id === id);
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
    const salaryPropertyValue = findPropertyValueByLabel(jobProps.content, 'Annual Salary');
    const annualBonusValue = findPropertyValueByLabel(jobProps.content, 'Annual Bonus');
    const signingBonusValue = findPropertyValueByLabel(jobProps.content, 'Signing Bonus');
    const employeeId = findPropertyValueById(jobProps.content, process.env.SR_EMPLOYEE_PROP_ID);

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
          startDate: findPropertyValueByLabel(jobProps.content, 'Start Date'),
          zipCode: findPropertyValueByLabel(jobProps.content, 'Zip Code'),
          country: findPropertyValueByLabel(jobProps.content, 'Country'),
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
    return applicant;
  }));

  return applicants;
};

/**
 * Adds the SAP employee ID to Smart Recruiters applicant as a property value.
 * @param applicantId The id of the application from SR.
 * @param jobId The id of the Job which applicant is primarily assigned to (from SR).
 * @param sapId The SAP ID to be assigned to this applicant.
 * @returns true if the call to Smart Recruiter succeeds, otherwise false.
 */
const addEmployeeId = async (applicantId, jobId, sapId) => {
  try {
    const apiToken = process.env.SR_API_TOKEN;
    let apiEndpoint = process.env.SR_ADD_PROPERTY_URL;
    apiEndpoint = apiEndpoint.replace('{candidateId}', applicantId);
    apiEndpoint = apiEndpoint.replace('{jobId}', jobId);
    apiEndpoint = apiEndpoint.replace('{propertyId}', process.env.SR_EMPLOYEE_PROP_ID);

    const options = {
      method: 'PUT',
      headers: {
        'X-SmartToken': apiToken,
        'Content-Type': 'application/json'
      },
    };

    const putBody = {
      value: `${sapId}`
    };

    const SRresponse = await axios.put(apiEndpoint, putBody, options);
    if (SRresponse && SRresponse.status === 204) {
      console.log(`Smart Recruiters post succeeded.  Applicant:  ${applicantId}, SAP employee id: ${sapId}`);
      return true;
    }

    console.log(`Smart Recruiters post failed.  ApplicantId:  ${applicantId}, employee id: ${sapId}, Response: ${JSON.stringify(SRresponse)}`);
    return false;
  } catch (err) {
    console.log(`Exception posting applicant employee id to Smart Recruiters: ${err.message}`);
    throw err;
  }
};


module.exports = {
  getApplicants,
  addEmployeeId
};
