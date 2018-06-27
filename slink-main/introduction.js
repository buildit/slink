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

  const ftes = split(applicant => applicant.fullTime === true, applicants);
  console.log(`Non-FTE applicants skipped: ${ftes.nonMatches.length}`);
  const needsIntroduction = split(applicant => applicant.employeeId === null, ftes.matches);
  console.log(`Already-introduced applicants skipped: ${needsIntroduction.nonMatches.length}`);

  const applicantsIntroducedToSap =
    await Promise.all(needsIntroduction.matches
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

  return { applicantsIntroducedToSap };
};

/**
 * Splits the given array based on the given predicate, and returns an object holding a pair of properties holding
 * the matching and non-matching results.
 * @param predicate
 * @param ary
 * @returns {{matches: *, nonMatches: *}}
 */
function split(predicate, ary) {
  const tuple = R.partition(predicate, ary);
  return {
    matches: R.head(tuple),
    nonMatches: R.last(tuple)
  };
}

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
