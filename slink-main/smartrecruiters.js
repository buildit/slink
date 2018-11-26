'use strict';

const log = require('./log');
const { LOG_INFO, LOG_ERROR } = require('./constants');
const notification = require('./notification');

const axios = require('axios');
const asyncThrottle = require('async-throttle');
const R = require('ramda');
const config = require('./config');

const CONCURRENT_APPLICANTS = 4;

/**
 * Obtains applicant data, including summary, detail, and properties.
 * @param status SR status filter.
 * @param subStatus SR substatus filter.
 * @param limit Maximum results to return from SR.
 * @return {Promise<any[]>}
 */
const getApplicants = async (status, subStatus, limit = 100) => {
  const baseUrl = config.params.SR_SUMMARY_URL.value;
  const queryString = `status=${status}&subStatus=${subStatus}&limit=${limit}`;
  const fullUrl = `${baseUrl}?${queryString}`;
  log(LOG_INFO, 'SR query:', fullUrl);

  const candidateSummaries = await srGet(fullUrl);
  const throttle = asyncThrottle(CONCURRENT_APPLICANTS); // Avoid 429
  log(LOG_INFO, `Converting ${candidateSummaries.content.length} candidates to applicants, ${CONCURRENT_APPLICANTS} at a time`);
  return Promise.all(candidateSummaries.content.map(candidate => throttle(async () => toApplicant(candidate))));
};


async function toApplicant(summary) {
  const candidateDetail = await srGet(summary.actions.details.url);
  const jobDetail = await srGet(candidateDetail.primaryAssignment.job.actions.details.url);

  const jobProps = await getJobProperties(summary.id, summary.primaryAssignment.job.id);
  const salaryPropertyValue = findPropertyValueBy(jobProps.content, 'label', 'Annual Salary');
  const annualBonusValue = findPropertyValueBy(jobProps.content, 'label', 'Annual Bonus');
  const signingBonusValue = findPropertyValueBy(jobProps.content, 'label', 'Signing Bonus');
  const employeeId = findPropertyValueBy(jobProps.content, 'id', config.params.SR_EMPLOYEE_PROP_ID.value);

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
        startDate: findPropertyValueBy(jobProps.content, 'label', 'Start Date'),
        zipCode: findPropertyValueBy(jobProps.content, 'label', 'Zip Code'),
        country: findPropertyValueBy(jobProps.content, 'label', 'Country'),
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
}


/**
 * Adds the SAP employee ID to Smart Recruiters applicant as a property value.
 * @param applicantId The id of the application from SR.
 * @param jobId The id of the Job which applicant is primarily assigned to (from SR).
 * @param sapId The SAP ID to be assigned to this applicant.
 * @returns true if the call to Smart Recruiter succeeds, otherwise false.
 */
const storeEmployeeId = async (applicantId, jobId, sapId) => {
  try {
    const apiToken = config.params.SR_TOKEN.value;
    let apiEndpoint = config.params.SR_ADD_PROP_URL.value;
    apiEndpoint = apiEndpoint.replace('{candidateId}', applicantId);
    apiEndpoint = apiEndpoint.replace('{jobId}', jobId);
    apiEndpoint = apiEndpoint.replace('{propertyId}', config.params.SR_EMPLOYEE_PROP_ID.value);

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

    const srResponse = await axios.put(apiEndpoint, putBody, options);
    if (srResponse && srResponse.status === 204) {
      log(LOG_INFO, `Smart Recruiters post succeeded.  Applicant:  ${applicantId}, SAP employee id: ${sapId}`);
      return true;
    }
    notification('Smart recruiter post failed', `ApplicantId:  ${applicantId}, employee id: ${sapId}, Response: ${JSON.stringify(srResponse)}`);
    log(LOG_ERROR, `Smart Recruiters post failed.  ApplicantId:  ${applicantId}, employee id: ${sapId}, Response: ${JSON.stringify(srResponse)}`);
    return false;
  } catch (err) {
    log(LOG_ERROR, `Exception posting applicant employee id to Smart Recruiters: ${err.message}`);
    throw err;
  }
};

async function srGet(url) {
  try {
    const apiToken = config.params.SR_TOKEN.value;
    const options = {
      method: 'GET',
      headers: { 'X-SmartToken': apiToken }
    };

    const reply = await axios.get(url, options);

    return reply.data;
  } catch (err) {
    if (err.response) {
      log(LOG_ERROR, `Error response from SmartRecruiters API. Status: ${err.response.status}, URL: ${url}, Headers: ${JSON.stringify(err.response.headers)}, Error: ${err}`);
    } else if (err.request) {
      log(LOG_ERROR, `Error calling SmartRecruiters API. Status: ${err.request}, Error: ${err}`);
    } else {
      log(LOG_ERROR, 'Unexpected error interacting with SmartRecruiters', err.message);
    }
    throw err;
  }
}

async function getJobProperties(candidateId, jobId) {
  let apiEndpoint = config.params.SR_JOB_PROPS_URL.value;
  if (apiEndpoint != null) {
    apiEndpoint = apiEndpoint.replace('{candidateId}', candidateId);
    apiEndpoint = apiEndpoint.replace('{jobId}', jobId);
  }
  return srGet(apiEndpoint);
}

function findPropertyValueBy(props, discriminator, discriminatorValue) {
  const foundObject = R.find(R.propEq(discriminator, discriminatorValue), props);
  return R.propOr(null, 'value', foundObject);
}

function getValue(property) {
  return property != null ? property.value : null;
}

function getCode(property) {
  return property != null ? property.code : null;
}

module.exports = {
  getApplicants,
  storeEmployeeId
};
