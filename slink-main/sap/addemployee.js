'use strict';

const log = require('../log');
const notification = require('../notification');
const {
  LOG_INFO,
  LOG_ERROR,
  SAP_DEFAULT_ZIPCODE,
  SAP_DEFAULT_STRING,
  SAP_DEFAULT_MISSING_STRING,
  SAP_DEFAULT_FAILURE_FLAGS,
  SAP_DEFAULT_SUCCESS_FLAGS,
  REASON_SAP_POST_FAILURE
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
 * @param resumeNumber The 'resume number' to use with SAP.  Does not come from SR data.
 * @returns {Promise<String>} Employee ID.
 */
const execute = async (applicant, resumeNumber) => {
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

    const postBody = buildPostBody(applicant, resumeNumber);
    const sapResponse = await axios.post(apiEndpoint, postBody, options);

    const { output } = sapResponse.data;
    if (output && 'ReturnFlag' in output && SAP_DEFAULT_FAILURE_FLAGS.indexOf(output.ReturnFlag) !== -1) {
      log(LOG_ERROR, postResultMessage('failed', applicant, resumeNumber, output));
      return null;
    } else if (output && 'ReturnFlag' in output && SAP_DEFAULT_SUCCESS_FLAGS.indexOf(output.ReturnFlag) !== -1) {
      log(LOG_INFO, postResultMessage('succeeded', applicant, resumeNumber, output));
      return output.EmployeeId;
    }


    log(LOG_ERROR, postResultMessage('indeterminate', applicant, resumeNumber, output));
    return null;
  } catch (err) {
    log(LOG_ERROR, `Exception posting applicant to SAP: ${err.message}`, err);
    throw err;
  }
};


/**
 * Builds an SAP POST body for introducing an applicant to SAP.<br/>
 * Note:  If a field has a literal, then that value was provided in
 *        the "SR-SAP Integration Spec Overview" document that can
 *        be found in Confluence (http://tinyurl.com/ycxhsfoj).
 * @param applicant Applicant built from SR data.
 * @param resumeNumber Pseudo-random "unique" number.  No better spec than that, unfortunately.
 * @param offerDate Date used as a source for date fields sent to SAP.  This is a punt, for now.
 * @returns fully filled-out body that can be posted to SAP
 */
function buildPostBody(applicant, resumeNumber, offerDate = new Date()) {
  return {
    input: {
      applicantId: {
        First_Name: applicant.firstName,
        Last_Name: applicant.lastName,
        Middle_Name: '',
        Date_of_Birth: '01-Jan-1900',
        Resume_Number: resumeNumber,
        Applicant_Group: '5',
        Personal_Area: 'USGA', // Differs from document, per Chris Mundt
        Personal_SubArea: '6',
        Form_of_Address: '1',
        Nationality: 'US',
        Language: 'EN',
        Street: MISSING_STRING,
        CITY: applicant.location.city || DEFAULT_STRING,
        District: MISSING_STRING,
        Pin_Code: formatPinZip(applicant.primaryAssignment.job.zipCode),
        Country: applicant.location.country || MISSING_STRING, // TODO:  mapping needed?
        Contact_Number: formatPhoneNumber(applicant.phoneNumber),
        Source: '00001197',
        Recruiter_Id: '10068175',
        Employer_City: formatCity(applicant.experience.location),
        External_AppId: 'SR',
        proactive_flag: 'Y'
      },
      contractOffer: {
        careerband: 'B2',
        offeredCurrency: applicant.primaryAssignment.job.offeredCurrency || 'USD',
        reportingManager: '117543',
        jobcode: '0',
        educationType: '03',
        branchofStudy: '00027_02',
        salary: [
          {
            compCode: 'BASIC',
            compValue: `${Math.floor(applicant.primaryAssignment.job.annualSalary / 12)}`
          },
          {
            compCode: 'HRA',
            compValue: '4668'
          },
          {
            compCode: 'QPLC',
            compValue: applicant.primaryAssignment.job.annualBonus ? `${applicant.primaryAssignment.job.annualBonus}` : '0'
          },
          {
            compCode: 'PF',
            compValue: '1120'
          },
          {
            compCode: 'CA',
            compValue: '1600'
          },
          {
            compCode: 'FXDBNS',
            compValue: '1867'
          },
          {
            compCode: 'GRATUITY',
            compValue: '496'
          },
          {
            compCode: 'MEDICAL',
            compValue: '600'
          },
          {
            compCode: 'WBP',
            compValue: '5650'
          }
        ],
        bonus: [],
        Offer_Date: formatSapDate(offerDate), // TODO when properties available
        Applicant_Level: 'G1',
        Stream_Description: '',
        Designation: 'Denver', // Differs from document, per Chris Mundt
        Candidate_Email: applicant.email || MISSING_STRING,
        FTE_End_Date: '',
        Previous_Education_Start_Date: '01-Jan-1900',
        Previous_Education_End_Date: '01-Jan-1900',
        Institute: '',
        Country: '',
        Course_Duration: '',
        Course_Duration_Type: '',
        Year_of_passing: '',
        Marks_obtained: '',
        Mode_of_education: '',
        Previous_Employment_Start_Date: '01-Jan-1900',
        Previous_Employment_End_Date: '01-Jan-1900',
        Employer_Name: '',
        Employer_City: '',
        Employer_Country: '',
        Employer_Industry: 'WT24',
        Employer_Company: '',
        Previous_Gross_Salary: '',
        // Hokey?
        Joining_Date: formatSapDate(currentDateIfNull(applicant.primaryAssignment.job.startDate)),
        Previous_Salary: '',
        Previous_Salary_Currency: 'USD',
        Previous_Experience_Years: '',
        Previous_Experience_Months: '',
        Relevant_Experience_Years: '',
        Relevant_Experience_Months: '',
        Interview_Panel_Id: ''
      }
    },
    output: null
  };
}

function formatPhoneNumber(phoneNumber) {
  if (phoneNumber) {
    const phoneNoSpaces = phoneNumber.replace(/ */g, '');
    return phoneNoSpaces.substr(phoneNoSpaces.length - 10);
  }
  return MISSING_STRING;
}

function formatSapDate(date) {
  const pieces = date.toDateString()
    .split(' ');
  return `${pieces[2]}-${pieces[1]}-${pieces[3]}`;
}

function formatPinZip(zipCode) {
  if (zipCode && zipCode.match(/^\d{5}(?:[-\s]\d{4})?$/)) {
    return zipCode;
  }
  return DEFAULT_ZIP_CODE;
}

function formatCity(city) {
  if (city && city.match(/[A-Za-z]+/)) {
    return city;
  }
  return MISSING_STRING;
}

function currentDateIfNull(date) {
  return new Date(date || new Date().getTime());
}

function postResultMessage(disposition, applicant, resumeNumber, output) {
  if (disposition === 'failed') {
    const msg = `Resume number: ${resumeNumber}, Applicant: ${JSON.stringify(util.sanitizeApplicant(applicant))}`;
    notification(REASON_SAP_POST_FAILURE, msg);
  }
  return `SAP post ${disposition}.  Applicant:  ${JSON.stringify(util.sanitizeApplicant(applicant))}, Resume number: ${resumeNumber}, Response: ${JSON.stringify(output)}`;
}

module.exports = {
  execute,
  buildPostBody,
  MISSING_STRING,
  DEFAULT_STRING,
  DEFAULT_ZIP_CODE
};
