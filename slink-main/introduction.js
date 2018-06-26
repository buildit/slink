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

  const applicantsIntroducedToSap =
    await Promise.all(applicants
      .filter(applicant => applicant.fullTime)
      .filter(applicant => applicant.employeeId === null)
      .map(async (applicant) => {
        const sanitizedApplicant = util.sanitizeApplicant(applicant);

        console.log(`Preparing to post applicant to SAP: ${JSON.stringify(sanitizedApplicant)}`);
        const employeeId = await sap.postApplicant(applicant, util.generateResumeNumber());

        if (employeeId != null) { // TODO more detailed return from postApplicant?
          sanitizedApplicant.employeeId = employeeId;
          const srSuccess = await postEmployeeIdToSmartRecruiters(employeeId, applicant);

          const results = {
            applicant: sanitizedApplicant,
            status: (srSuccess ? 'Succeeded' : 'Failed')
          };
          if (!srSuccess) {
            results.reason = 'SR post failure';
          }
          return results;
        }

        return {
          applicant: sanitizedApplicant,
          status: 'Failed',
          reason: 'SAP post failure'
        };
      }));
  console.log(`Applicants sent to SAP: ${JSON.stringify(applicantsIntroducedToSap)}`);

  return { applicantsIntroducedToSap };
};

async function postEmployeeIdToSmartRecruiters(employeeId, applicant) {
  console.log(`Preparing to add SAP employee id to Smart Recruiters: ${employeeId}`);
  return sr.storeEmployeeId(
    applicant.id,
    applicant.primaryAssignment.job.id,
    employeeId
  );
}

module.exports = {
  process
};
