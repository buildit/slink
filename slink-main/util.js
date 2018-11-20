'use strict';

const R = require('ramda');

const sanitizeApplicant = applicant => R.pick(['id', 'lastName', 'firstName'], applicant);

/**
 * Creates a half-assed, semi-random, hopefully-unique number to give to the SAP API.<br/>
 * This number is very poorly defined at the moment, thus this code exists, which is horrifying.
 * @returns {number}
 */
function generateResumeNumber() {
  const min = 350000; // determined by choosing a number significantly higher than that used for manual Postman tests.
  // const max = 9999999999; // Max allowed by API, and should give us enough integer space to mostly avoid duplicates.
  const max = 99999999; // Max allowed by API is 8 digit resume number
  return Math.floor((Math.random() * (max - min)) + min);
}

/**
 * Returns a function that splits an Array into an object containing matches and non-matches.
 * @param predicate
 * @returns {{matches: *, rejects: *}}
 */
function split(predicate) {
  return R.pipe(R.partition(predicate), R.zipObj(['matches', 'rejects']));
}

module.exports = {
  sanitizeApplicant,
  generateResumeNumber,
  split
};
