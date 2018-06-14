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

  const processedApplicants =
    await Promise.all(applicants
      .filter(applicant => applicant.fullTime)
      .map(async (applicant) => {
        const sanitizedApplicant = util.sanitizeApplicant(applicant);
        console.log(`Preparing to post applicant to SAP: ${JSON.stringify(sanitizedApplicant)}`);

        const employeeId = await sap.postApplicant(applicant, util.generateResumeNumber());

        if (employeeId != null) { // TODO more detailed return from postApplicant?
          sanitizedApplicant.employeeId = employeeId;
          return {
            applicant: sanitizedApplicant,
            status: 'Succeeded'
          };
        }
        return {
          applicant: sanitizedApplicant,
          status: 'Failed'
        };
      }));
  console.log(`Processed applicants: ${JSON.stringify(processedApplicants)}`);

  return { processedApplicants };
};

module.exports = {
  process
};
