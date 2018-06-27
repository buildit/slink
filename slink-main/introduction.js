'use strict';

const R = require('ramda');

const sr = require('./smartrecruiters');
const sap = require('./sap');
const util = require('./util');

/*
 * Obtains applicants by calling the SmartRecruiters facade and calls SAP with each applicant.
 * @returns {Promise<{successfulApplicants: Array}>}
 */
const process = async () => {
  const applicants = await sr.getApplicants();
  console.log(`Collected ${applicants.length} applicants from SmartRecruiters`);

  const fullTimeTuple = R.partition(applicant => applicant.fullTime === true, applicants);
  const introductionTuple = R.partition(applicant => applicant.employeeId === null, R.head(fullTimeTuple));
  console.log(`Non-FTE applicants skipped: ${R.last(fullTimeTuple).length}`);
  console.log(`Already-introduced applicants skipped: ${R.last(introductionTuple).length}`);

  const applicantsIntroducedToSap =
    await Promise.all(R.head(introductionTuple).map(async (applicant) => {
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
