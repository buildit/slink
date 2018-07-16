'use strict';

const sr = require('./smartrecruiters');
const app = require('./applicant');
const sapAddEmployee = require('./sap/addemployee');
const applicantDao = require('./dao/introductionsdao');
const util = require('./util');

/*
 * Obtains applicants by calling the SmartRecruiters facade and calls SAP with each applicant.
 * @returns {Promise<{successfulApplicants: Array}>}
 */
const process = async () => {
  const applicants = await getEligibleApplicants();

  const applicantsIntroducedToSap =
    await Promise.all(applicants.matches
      .map(applicant => introduce((applicant))));

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

async function introduce(applicant) {
  const sanitizedApplicant = util.sanitizeApplicant(applicant);

  console.info(`Preparing to post applicant to SAP: ${JSON.stringify(sanitizedApplicant)}`);
  const resumeNumber = util.generateResumeNumber();
  const employeeId = await sapAddEmployee.execute(applicant, resumeNumber);

  if (employeeId != null) {
    await applicantDao.write({
      srCandidateId: applicant.id,
      slinkResumeNumber: resumeNumber,
      sapEmployeeId: employeeId
    });

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
}

async function getEligibleApplicants() {
  const applicants = await sr.getApplicants();
  console.info(`Collected ${applicants.length} applicants from SmartRecruiters`);

  const splitByFte = util.split(applicant => app.isFte(applicant));
  const splitByNeedsIntroduction = util.split(applicant => !app.hasEmployeeId(applicant));

  const ftes = splitByFte(applicants);
  console.info(`Non-FTE applicants skipped: ${ftes.rejects.length}`);
  const ftesNeedingIntroduction = splitByNeedsIntroduction(ftes.matches);
  console.info(`Already-introduced applicants skipped: ${ftesNeedingIntroduction.rejects.length}`);
  return ftesNeedingIntroduction;
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
  process,
  introduce,
  getEligibleApplicants
};
