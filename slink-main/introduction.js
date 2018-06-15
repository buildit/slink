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

          console.log(`Preparing to add SAP employee id to Smart Recruiters: ${JSON.stringify(sanitizedApplicant)}`);
          const srStatusFlag = await sr.addEmployeeId(
            applicant.id,
            applicant.primaryAssignment.job.id,
            employeeId
          );

          return {
            applicant: sanitizedApplicant,
            status: (srStatusFlag ? 'Succeeded' : 'Failed')
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
