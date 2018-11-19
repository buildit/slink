'use strict';

const log = require('./log');
const {
  LOG_INFO,
  SR_OFFERED,
  SR_OFFER_ACCEPTED,
  STATUS_SUCCESS,
  STATUS_FAILURE,
  REASON_SAP_POST_FAILURE,
  REASON_SR_POST_FAILURE
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
  const ftesNeedingIntroduction = splitByNeedsIntroduction(ftes.matches);
  log(LOG_INFO, `Already-introduced applicants skipped: ${ftesNeedingIntroduction.rejects.length}`);

  const applicantsIntroducedToSap =
    await Promise.all(ftesNeedingIntroduction.matches
      .map(async (applicant) => {
        /*
         * NOTE: Below variable is used for making trials if it fails with SAP API
         * Since application can't find out next action by response from the backend,
         * So it makes 3 API calls to SAP with different resume number
         * but it only works if failure is because of uniqueness of resume number.
         * TODO: Need some robust mechanism to take next action by the application in case of API failure
         */
        let trialCount = 0;
        let failureFlag = false;
        /*
         * This function is created just for calling from failure
         * block of the code to re-post again to API. Else it's unnecessary
         */
        async function addEmployee() {
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
              status: (srSuccess ? STATUS_SUCCESS : STATUS_FAILURE)
            };
            if (!srSuccess) {
              results.reason = REASON_SR_POST_FAILURE;
            }
            return results;
          }

          if (trialCount <= 3) {
            /* This is trick to call api again with different resume number
             * in case of failure occured due to resume number,
             * But it can't guarantee subsequent call will give success from the api
             */
            failureFlag = true;
          }
          return {
            applicant: sanitizedApplicant,
            status: STATUS_FAILURE,
            reason: REASON_SAP_POST_FAILURE
          };
        }
        let employee = await addEmployee();
        if (failureFlag) {
          trialCount += 1;
          failureFlag = false;
          log(LOG_INFO, `${REASON_SAP_POST_FAILURE}, trying again TRIAL NO: ${trialCount}`);
          employee = await addEmployee();
        }
        return employee;
      }));

  const successfulApplicants = applicantsIntroducedToSap.filter(item => item.status === STATUS_SUCCESS);
  const unsuccessfulApplicants = applicantsIntroducedToSap.filter(item => item.status === STATUS_FAILURE);

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
