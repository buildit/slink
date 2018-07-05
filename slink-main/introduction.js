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
  console.info(`Collected ${applicants.length} applicants from SmartRecruiters`);

  const splitByFte = split(applicant => applicant.fullTime === true);
  const splitByNeedsIntroduction = split(applicant => applicant.employeeId === null);

  const ftes = splitByFte(applicants);
  console.info(`Non-FTE applicants skipped: ${ftes.rejects.length}`);
  const ftesNeedingIntroduction = splitByNeedsIntroduction(ftes.matches);
  console.info(`Already-introduced applicants skipped: ${ftesNeedingIntroduction.rejects.length}`);

  const applicantsIntroducedToSap =
    await Promise.all(ftesNeedingIntroduction.matches
      .map(async (applicant) => {
        const sanitizedApplicant = util.sanitizeApplicant(applicant);

        console.info(`Preparing to post applicant to SAP: ${JSON.stringify(sanitizedApplicant)}`);
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

  const successfulApplicants = applicantsIntroducedToSap.filter(item => item.status === 'Succeeded');
  const unsuccessfulApplicants = applicantsIntroducedToSap.filter(item => item.status === 'Failed');

  const result = {
    attempted: successfulApplicants.length + unsuccessfulApplicants.length,
    successful: successfulApplicants.length,
    unsuccessful: unsuccessfulApplicants.length,
    successfulApplicants,
    unsuccessfulApplicants
  };

  console.info(`Introduction process complete. Results: ${JSON.stringify(result)}`);

  return result;
};

/**
 * Returns a function that splits an Array into an object containing matches and non-matches.
 * @param predicate
 * @returns {{matches: *, rejects: *}}
 */
function split(predicate) {
  return R.pipe(R.partition(predicate), R.zipObj(['matches', 'rejects']));
}

async function postEmployeeIdToSmartRecruiters(employeeId, applicant) {
  console.info(`Preparing to add SAP employee id to Smart Recruiters: ${employeeId}`);
  return sr.storeEmployeeId(
    applicant.id,
    applicant.primaryAssignment.job.id,
    employeeId
  );
}

module.exports = {
  process
};
