'use strict';

const sr = require('./smartrecruiters');
const sap = require('./sap');
const util = require('./util');

/*
 * Obtains applicants by calling the SmartRecruiters facade and calls SAP with each applicant.
 * @returns {Promise<{successfulApplicants: Array}>}
 */
const process = async () => {
  const applicants = await sr.getApplicants();
  const successfulApplicants = [];

  // TODO: only process one for now
  Promise.all(applicants.forEach(async (applicant) => {
    const secureApplicant = util.secureApplicant(applicant);
    console.log(`Preparing to post applicant to SAP: ${JSON.stringify(secureApplicant)}`);

    const employeeId = await sap.postApplicant(applicant, util.generateResumeNumber());

    if (employeeId != null) { // TODO more detailed return from postApplicant.
      secureApplicant.employeeId = employeeId;
      successfulApplicants.push(secureApplicant);
    }
  }));
  console.log(`Processed applicants: ${JSON.stringify(successfulApplicants)}`);

  return { successfulApplicants };
};

module.exports = {
  process
};
