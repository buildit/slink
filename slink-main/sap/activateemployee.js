'use strict';

const log = require('../log');
const {
  LOG_INFO,
  LOG_ERROR,
  SAP_DEFAULT_CHANGED_BY,
  SAP_DEFAULT_ACTION,
  SAP_DEFAULT_COMPANY,
  SAP_DEFAULT_APPID,
  SAP_DEFAULT_ZIPCODE,
  SAP_DEFAULT_STRING,
  SAP_DEFAULT_MISSING_STRING,
  SAP_DEFAULT_SUCCESS_RESP
} = require('../constants');

const axios = require('axios');
const util = require('../util');
const config = require('../config');

const MISSING_STRING = SAP_DEFAULT_MISSING_STRING;
const DEFAULT_STRING = SAP_DEFAULT_STRING;
const DEFAULT_ZIP_CODE = SAP_DEFAULT_ZIPCODE; // Unlikely marker zip code because SAP appears to require one.

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
    if (output && output.Response === SAP_DEFAULT_SUCCESS_RESP) {
      log(LOG_ERROR, postResultMessage('succeeded', applicant, output));
      return true;
    }

    log(LOG_INFO, postResultMessage('failed', applicant, output));
    return false;
  } catch (err) {
    log(LOG_ERROR, `Exception posting applicant to SAP: ${err.message}`);
    throw err;
  }
};


/**
 * Builds an SAP POST body for activating an applicant in SAP.<br/>
 * Note:  If a field has a literal, then that value was provided in
 *        the "SR-SAP Integration Spec Overview" document that can
 *        be found in Confluence (http://tinyurl.com/ycxhsfoj).
 * @param applicant Applicant built from SR data.
 * @return {{inputs: {EmployeeNumber: (number|null|string|*),
 * ChangedBy: string, DOJ: string, Action: string, Comments: string, Company: string, External_AppId: string}}}
 */
function buildPostBody(applicant) {
  return {
    inputs: {
      EmployeeNumber: applicant.employeeId,
      ChangedBy: SAP_DEFAULT_CHANGED_BY,
      DOJ: formatSapDate(currentDateIfNull(applicant.primaryAssignment.job.startDate)),
      Action: SAP_DEFAULT_ACTION,
      Comments: '',
      Company: SAP_DEFAULT_COMPANY,
      External_AppId: SAP_DEFAULT_APPID
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
