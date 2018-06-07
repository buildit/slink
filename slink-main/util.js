'use strict';

const secureApplicant = applicant => ({
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
  const max = 99999999;
  const min = 3450000;
  return Math.floor((Math.random() * (max - min)) + min);
}

module.exports = {
  secureApplicant,
  generateResumeNumber
};
