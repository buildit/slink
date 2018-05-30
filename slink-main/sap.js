'use strict';

const axios = require('axios');

const buildPostBody = (firstName, lastName) => ({
  input: {
    applicantId: {
      First_Name: firstName,
      Last_Name: lastName,
      Middle_Name: '',
      Date_of_Birth: '01-Jan-1900',
      Resume_Number: '7930586',
      Applicant_Group: '5',
      Personal_Area: 'CTUS',
      Personal_SubArea: '6',
      Form_of_Address: '1',
      Nationality: 'US',
      Language: 'EN',
      Street: 'NA',
      CITY: 'ATLANTA',
      District: 'NA',
      Pin_Code: '30301',
      Country: 'USA',
      Contact_Number: '4101234567,4102345678',
      Source: '00001197',
      Recruiter_Id: '10068175',
      Employer_City: 'ATLANTA',
      External_AppId: 'SR',
      proactive_flag: 'Y'
    },
    contractOffer: {
      careerband: 'B2',
      offeredCurrency: 'USD',
      reportingManager: '117543',
      jobcode: '0',
      educationType: '03',
      branchofStudy: '00027_02',
      salary: [
        {
          compCode: 'BASIC',
          compValue: '9335'
        },
        {
          compCode: 'HRA',
          compValue: '4668'
        },
        {
          compCode: 'QPLC',
          compValue: '1334'
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
      Offer_Date: '19-Mar-2018',
      Applicant_Level: 'G1',
      Stream_Description: '',
      Designation: 'Denver',
      Candidate_Email: 'shakenbake@gmail.com',
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
      Joining_Date: '24-May-2018',
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
 * @returns {Promise<String>} Employee ID.
 */
const postApplicant = async (applicant) => {
  console.log(`Submitting applicant ${JSON.stringify(applicant)} to SAP`);
  try {
    const apiEndpoint = process.env.SAP_ADD_EMPLOYEE_URL;
    const options = {
      method: 'POST',
      headers: {
        Username: process.env.SAP_USERNAME,
        Password: process.env.SAP_USERNAME
      },
      url: apiEndpoint,
      data: buildPostBody()
    };

    const sapResponse = await axios(options);

    if (sapResponse.output && sapResponse.output.ReturnFlag === 'F') {
      return null;
    }
    return sapResponse.output.EmployeeId;
  }
  catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = { postApplicant };
