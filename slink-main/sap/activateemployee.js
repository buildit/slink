'use strict';

const axios = require('axios');
const util = require('../util');
const config = require('../config');

const MISSING_STRING = '';
const DEFAULT_STRING = 'NA';
const DEFAULT_ZIP_CODE = '40391'; // Unlikely marker zip code because SAP appears to require one.

/**
 * Receives an applicant object and uses it to POST to SAP, resulting in an employee (and importantly, an employee ID).
 * @param applicant The object to submit to SAP.
 * @returns {Promise<boolean>} Employee ID.
 */
const execute = async (applicant) => {
  try {
    const apiEndpoint = config.params.SAP_ADD_EMPLOYEE_URL.value;
    const options = {
      method: 'POST',
      headers: {
        Username: config.params.SAP_USERNAME.value,
        Password: config.params.SAP_PASSWORD.value,
        'Content-Type': 'application/json'
      }
    };

    const postBody = buildPostBody(applicant);
    const sapResponse = await axios.post(apiEndpoint, postBody, options);

    const { output } = sapResponse.data;
    if (output && output.Response === 'SUCCESS') {
      console.error(postResultMessage('succeeded', applicant, output));
      return true;
    }

    console.info(postResultMessage('failed', applicant, output));
    return false;
  } catch (err) {
    console.error(`Exception posting applicant to SAP: ${err.message}`);
    throw err;
  }
};


/**
 * Builds an SAP POST body for activating an applicant in SAP.<br/>
 * Note:  If a field has a literal, then that value was provided in
 *        the "SR-SAP Integration Spec Overview" document that can
 *        be found in Confluence (http://tinyurl.com/ycxhsfoj).
 * @param applicant Applicant built from SR data.
 * @returns fully filled-out body that can be posted to SAP
 */
function buildPostBody(applicant) {
  return {
    inputs: {
      EmployeeNumber: applicant.employeeId,
      ChangedBy: '00001197',
      DOJ: formatSapDate(currentDateIfNull(applicant.primaryAssignment.job.startDate)),
      Action: 'ACTIVE',
      Comments: '',
      Company: 'WT',
      External_AppId: 'SR'
    }
  };
}

function formatSapDate(date) {
  const iso = date.toISOString()
    .slice(0, 10)
    .split('-');
  return `${iso[1]}-${iso[2]}-${iso[0]}`;
}

function currentDateIfNull(date) {
  return new Date(date || new Date().getTime());
}

function postResultMessage(disposition, applicant, output) {
  return `SAP post ${disposition}.  Applicant:  ${JSON.stringify(util.sanitizeApplicant(applicant))}, Response: ${JSON.stringify(output)}`;
}

module.exports = {
  execute,
  buildPostBody,
  MISSING_STRING,
  DEFAULT_STRING,
  DEFAULT_ZIP_CODE
};
