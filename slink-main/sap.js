'use strict';

const axios = require('axios');
const util = require('./util');

const MISSING_STRING = '';
const DEFAULT_STRING = 'NA';

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
const buildPostBody = (applicant, resumeNumber, offerDate = new Date()) => (
  {
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
        Pin_Code: formatPinZip(applicant),
        Country: applicant.location.country || MISSING_STRING, // TODO:  mapping needed?
        Contact_Number: applicant.phoneNumber ? applicant.phoneNumber.replace(/ */g, '') : '',
        Source: '00001197',
        Recruiter_Id: '10068175',
        Employer_City: formatCity(applicant.experience.location),
        External_AppId: 'SR',
        proactive_flag: 'Y'
      },
      contractOffer: {
        careerband: 'B2',
        offeredCurrency: applicant.primaryAssignment.job.offeredCurrency,
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
            compValue: `${applicant.primaryAssignment.job.annualBonus}` || '0'
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
  });

/**
 * Receives an applicant object and uses it to POST to SAP, resulting in an employee.
 * @param applicant The object to submit to SAP.
 * @param resumeNumber The 'resume number' to use with SAP.  Does not come from SR data.
 * @returns {Promise<String>} Employee ID.
 */
const postApplicant = async (applicant, resumeNumber) => {
  try {
    const apiEndpoint = process.env.SAP_ADD_EMPLOYEE_URL;
    const options = {
      method: 'POST',
      headers: {
        Username: process.env.SAP_USERNAME,
        Password: process.env.SAP_PASSWORD,
        'Content-Type': 'application/json'
      }
    };

    const postBody = buildPostBody(applicant, resumeNumber);
    console.log(`'postBody', ${JSON.stringify(postBody)}`);
    const sapResponse = await axios.post(apiEndpoint, postBody, options);

    const { output } = sapResponse.data;
    if (output && output.ReturnFlag === 'F') {
      console.log(`SAP post failed.  Applicant:  ${JSON.stringify(util.sanitizeApplicant(applicant))}, Resume number: ${resumeNumber}, Response: ${JSON.stringify(output)}`);
      return null;
    }

    console.log(`SAP post succeeded.  Applicant:  ${JSON.stringify(util.sanitizeApplicant(applicant))}, Resume number: ${resumeNumber}, Response: ${JSON.stringify(output)}`);
    return output.EmployeeId;
  } catch (err) {
    console.log(`Exception posting applicant to SAP: ${err.message}`);
    throw err;
  }
};


function formatSapDate(date) {
  const pieces = date.toDateString().split(' ');
  return `${pieces[2]}-${pieces[1]}-${pieces[3]}`;
}

function formatPinZip(applicant) {
  const { zipCode } = applicant.primaryAssignment.job;
  if (zipCode && zipCode.match(/^\d{5}(?:[-\s]\d{4})?$/)) {
    return zipCode;
  }
  return MISSING_STRING;
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

module.exports = {
  postApplicant,
  buildPostBody,
  MISSING_STRING,
  DEFAULT_STRING
};
