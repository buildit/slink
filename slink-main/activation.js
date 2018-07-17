'use strict';

const sr = require('./smartrecruiters');
const sapActivateEmployee = require('./sap/activateemployee');
const activatedApplicantDao = require('./dao/activationsdao');
const util = require('./util');

const process = async () => {
  console.info('### Starting ACTIVATION process');
  const applicants = await sr.getApplicants({ subStatus: 'ONBOARDING' });
  console.info(`Activation: Collected ${applicants.length} applicants from SmartRecruiters`);

  const splitByFte = util.split(applicant => applicant.fullTime === true);
  const ftes = splitByFte(applicants);

  console.info(`Non-FTE applicants skipped: ${ftes.rejects.length}`);

  const splitByEmployeeId = util.split(fte => fte.employeeId !== null);
  const ftesWithId = splitByEmployeeId(ftes.matches);

  console.info(`Employees with no employee ID skipped: ${ftesWithId.rejects.length}`);

  const applicantsActivatedInSap =
    await Promise.all(ftesWithId.matches
      .map(async (fteWithId) => {
        const sapStatus = await sapActivateEmployee.execute(fteWithId);

        const result = {
          applicant: util.sanitizeApplicant(fteWithId),
          status: (sapStatus ? 'Succeeded' : 'Failed')
        };

        if (sapStatus) {
          // all good! save result to DB
          await activatedApplicantDao.write({
            srCandidateId: fteWithId.id,
            sapEmployeeId: fteWithId.employeeId
          });
        } else {
          // sap failure of some sort - to be clarified later
          result.reason = 'SAP post failure';
        }

        return result;
      }));

  const successfulActivations = applicantsActivatedInSap.filter(item => item.status === 'Succeeded');
  const unsuccessfulActivations = applicantsActivatedInSap.filter(item => item.status === 'Failed');

  const result = {
    attempted: successfulActivations.length + unsuccessfulActivations.length,
    successful: successfulActivations.length,
    unsuccessful: unsuccessfulActivations.length,
    successfulApplicants: successfulActivations,
    unsuccessfulApplicants: unsuccessfulActivations
  };

  console.info(`Activation process complete. Results: ${JSON.stringify(result)}`);

  return result;
};

module.exports = {
  process
};
