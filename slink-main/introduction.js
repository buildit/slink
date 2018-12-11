'use strict';

const log = require('./log');
const {
  LOG_INFO,
  SR_OFFERED,
  SR_OFFER_ACCEPTED,
  STATUS_SUCCESS,
  STATUS_FAILURE,
  REASON_SAP_POST_FAILURE,
  REASON_SR_POST_FAILURE,
  SAP_POST_FAILURE_RETRY_THRESHOLD
} = require('./constants');

const sr = require('./smartrecruiters');
const sapAddEmployee = require('./sap/addemployee');
const introductionsDao = require('./dao/introductionsdao');
const util = require('./util');

/*
 * Obtains applicants by calling the SmartRecruiters facade and calls SAP with each applicant.
 * @returns {Promise<{successfulApplicants: Array}>}
 */
const process = async () => {
  log(LOG_INFO, '### Starting INTRODUCTION process');
  const applicants = await sr.getApplicants(SR_OFFERED, SR_OFFER_ACCEPTED);

  const splitByFte = util.split(applicant => applicant.fullTime === true);
  const splitByNeedsIntroduction = util.split(applicant => applicant.employeeId === null);

  const ftes = splitByFte(applicants);
  log(LOG_INFO, `Non-FTE applicants skipped: ${ftes.rejects.length}`);
  let ftesNeedingIntroduction = splitByNeedsIntroduction(ftes.matches);
  log(LOG_INFO, `Already-introduced applicants skipped: ${ftesNeedingIntroduction.rejects.length}`);
  async function introduceApplicants(_applicants) {
    const result = await Promise.all(_applicants.map(async (applicant) => {
      const sanitizedApplicant = util.sanitizeApplicant(applicant);
      const resumeNumber = util.generateResumeNumber();

      log(LOG_INFO, `Posting applicant to SAP.  Resume number: ${resumeNumber}, applicant: ${JSON.stringify(sanitizedApplicant)}`);
      const employeeId = await sapAddEmployee.execute(applicant, resumeNumber);
      if (employeeId != null) {
        log(LOG_INFO, 'Writing item to introduction table for candidate', applicant.id);
        await writeIntroductionRecord(applicant, resumeNumber, employeeId);

        log(LOG_INFO, 'Posting SAP employee ID to SmartRecruiters for candidate', applicant.id);
        sanitizedApplicant.employeeId = employeeId;
        const srSuccess = await postEmployeeIdToSmartRecruiters(employeeId, applicant);

        const results = {
          applicant: sanitizedApplicant,
          status: srSuccess ? STATUS_SUCCESS : STATUS_FAILURE
        };
        if (!srSuccess) {
          results.reason = REASON_SR_POST_FAILURE;
        }
        return results;
      }
      return {
        applicant: sanitizedApplicant,
        status: STATUS_FAILURE,
        reason: REASON_SAP_POST_FAILURE
      };
    }));
    return result;
  }

  let applicantsIntroducedToSap = await introduceApplicants(ftesNeedingIntroduction
    && ftesNeedingIntroduction.matches.length > 0
    ? ftesNeedingIntroduction.matches : []);
  let successfulApplicants = applicantsIntroducedToSap ? applicantsIntroducedToSap.filter(item => item !== undefined && 'status' in item && item.status === STATUS_SUCCESS) : [];
  let unsuccessfulApplicants = applicantsIntroducedToSap ? applicantsIntroducedToSap.filter(item => item !== undefined && 'status' in item && item.status === STATUS_FAILURE) : [];

  const _ftesNeedingIntroduction = ftesNeedingIntroduction.matches;

  if (unsuccessfulApplicants && unsuccessfulApplicants.length > 0) {
    let _unsuccessfulApplicants = unsuccessfulApplicants.map(item => item.applicant);
    for (let i = 0; (i < SAP_POST_FAILURE_RETRY_THRESHOLD && _unsuccessfulApplicants.length > 0); i += 1) {
      ftesNeedingIntroduction = [];
      for (let j = 0; j < _unsuccessfulApplicants.length; j += 1) {
        for (let m = 0; m < _ftesNeedingIntroduction.length; m += 1) {
          if (_unsuccessfulApplicants[j].firstName === _ftesNeedingIntroduction[m].firstName
              && _unsuccessfulApplicants[j].lastName === _ftesNeedingIntroduction[m].lastName) {
            ftesNeedingIntroduction.push(_ftesNeedingIntroduction[m]);
          }
        }
      }
      if (ftesNeedingIntroduction.length > 0) {
        applicantsIntroducedToSap = await introduceApplicants(ftesNeedingIntroduction);
        successfulApplicants = successfulApplicants.concat(applicantsIntroducedToSap.filter(item => item !== undefined && 'status' in item && item.status === STATUS_SUCCESS));
        unsuccessfulApplicants = applicantsIntroducedToSap ? applicantsIntroducedToSap.filter(item => item !== undefined && 'status' in item && item.status === STATUS_FAILURE) : [];
        _unsuccessfulApplicants = unsuccessfulApplicants.map(item => item.applicant);
      }
    }
  }

  const result = {
    attempted: successfulApplicants.length + unsuccessfulApplicants.length,
    successful: successfulApplicants.length,
    unsuccessful: unsuccessfulApplicants.length,
    successfulApplicants,
    unsuccessfulApplicants
  };

  log(LOG_INFO, `Introduction process complete. Results: ${JSON.stringify(result)}`);

  return result;
};

async function postEmployeeIdToSmartRecruiters(employeeId, applicant) {
  log(LOG_INFO, `Preparing to add SAP employee id to Smart Recruiters: ${employeeId}`);
  return sr.storeEmployeeId(
    applicant.id,
    applicant.primaryAssignment.job.id,
    employeeId
  );
}

async function writeIntroductionRecord(applicant, resumeNumber, employeeId) {
  await introductionsDao.write({
    srCandidateId: applicant.id,
    slinkResumeNumber: resumeNumber,
    sapEmployeeId: employeeId
  });
}

module.exports = {
  process
};
