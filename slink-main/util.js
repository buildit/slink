'use strict';

const sanitizeApplicant = applicant => ({
  id: applicant.id,
  lastName: applicant.lastName,
  firstName: applicant.firstName
});


/**
 * Creates a half-assed, semi-random, hopefully-unique number to give to the SAP API.<br/>
 * This number is very poorly defined at the moment, thus this code exists, which is horrifying.
 * @returns {number}
 */
function generateResumeNumber() {
  const max = 999999999;
  // Below set by choosing a number significantly higher than that used for manual Postman tests.
  const min = 350000;
  return Math.floor((Math.random() * (max - min)) + min);
}

module.exports = {
  sanitizeApplicant,
  generateResumeNumber
};
