'use strict';

const asyncThrottle = require('async-throttle');


/**
 * Obtains applicant data, including summary, detail, and properties.
 * @param candidateSummaries Array of candidate summaries to process.
 * @param applicantConverter Function to convert candidates to applicants.
 * @param eligibilityFilter Function that returns true for applicants that are eligible for this process.
 * @param applicantOperation Function to process a single applicant record, e.g. introduce or activate.
 * @returns {Promise<{processedApplicants: Array, ineligibleApplicantCount: number}>}
 */
const execute = async (candidateSummaries, applicantConverter, eligibilityFilter, applicantOperation) => {
  const throttle = asyncThrottle(2);
  const processedApplicants = [];
  let ineligibleApplicantCount = 0;
  candidateSummaries.content.forEach((summary) => {
    throttle(async () => {
      const applicant = await applicantConverter(summary);
      if (eligibilityFilter(applicant)) {
        console.info(`Applicant '${applicant.lastName}' eligible, processing...`);
        const processingResult = await applicantOperation(applicant);
        console.info('applicantOperation result:', processingResult);
        processedApplicants.push(processingResult);
      } else {
        console.info(`Applicant '${applicant.lastName}' ineligible, skipping...`);
        ineligibleApplicantCount += 1;
      }
    });
  });
  return { processedApplicants, ineligibleApplicantCount };
};

module.exports = {
  execute
};
