'use strict';

const log = require('./log');
const {
  LOG_INFO,
  STATUS_SKIPPED,
  STATUS_SUCCESS,
  STATUS_FAILURE,
  REASON_ALREADY_ACTIVATED,
  REASON_SAP_POST_FAILURE,
  SR_OFFERED,
  SR_ONBOARDING
} = require('./constants');

const sr = require('./smartrecruiters');
const sapActivateEmployee = require('./sap/activateemployee');
const activatedApplicantDao = require('./dao/activationsdao');
const util = require('./util');

const process = async () => {
  log(LOG_INFO, '### Starting ACTIVATION process');
  const applicants = await sr.getApplicants(SR_OFFERED, SR_ONBOARDING);
  log(LOG_INFO, `Activation: Collected ${applicants.length} applicants from SmartRecruiters`);

  const splitByFte = util.split(applicant => applicant.fullTime === true);
  const ftes = splitByFte(applicants);

  log(LOG_INFO, `Non-FTE applicants skipped: ${ftes.rejects.length}`);

  const splitByEmployeeId = util.split(fte => fte.employeeId !== null);
  const ftesWithId = splitByEmployeeId(ftes.matches);

  log(LOG_INFO, `Employees with no employee ID skipped: ${ftesWithId.rejects.length}`);

  const applicantsActivatedInSap =
    await Promise.all(ftesWithId.matches
      .map(async (fteWithId) => {
        const sanitizeApplicant = util.sanitizeApplicant(fteWithId);

        const readApplicant = await activatedApplicantDao.read(fteWithId.id);
        if (Object.keys(readApplicant).length !== 0) {
          return {
            applicant: sanitizeApplicant,
            status: STATUS_SKIPPED,
            reason: REASON_ALREADY_ACTIVATED
          };
        }

        const sapStatus = await sapActivateEmployee.execute(fteWithId);

        const result = {
          applicant: sanitizeApplicant,
          status: (sapStatus ? STATUS_SUCCESS : STATUS_FAILURE)
        };

        if (sapStatus) {
          // all good! save result to DB
          await activatedApplicantDao.write({
            srCandidateId: fteWithId.id,
            sapEmployeeId: fteWithId.employeeId
          });
        } else {
          // sap failure of some sort - to be clarified later
          result.reason = REASON_SAP_POST_FAILURE;
        }

        return result;
      }));

  const successfulActivations = applicantsActivatedInSap.filter(item => item.status === STATUS_SUCCESS);
  const unsuccessfulActivations = applicantsActivatedInSap.filter(item => item.status === STATUS_FAILURE);
  const skippedActivations = applicantsActivatedInSap.filter(item => item.status === STATUS_SKIPPED);

  const result = {
    attempted: successfulActivations.length + unsuccessfulActivations.length,
    successful: successfulActivations.length,
    skipped: skippedActivations.length,
    unsuccessful: unsuccessfulActivations.length,
    successfulApplicants: successfulActivations,
    unsuccessfulApplicants: unsuccessfulActivations,
    skippedApplicants: skippedActivations
  };

  log(LOG_INFO, `Activation process complete. Results: ${JSON.stringify(result)}`);

  return result;
};

module.exports = {
  process
};
