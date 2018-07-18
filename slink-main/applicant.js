'use strict';

function isFte(applicant) {
  return applicant.fullTime === true;
}

function hasEmployeeId(applicant) {
  return applicant.employeeId !== null;
}

module.exports = {
  isFte,
  hasEmployeeId
};

