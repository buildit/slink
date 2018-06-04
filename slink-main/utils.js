'use strict';

const findApplicant = (candidateList, candidateId) => {
  for (const candidate of candidateList) {
    if (candidate.id === candidateId) {
      return candidate;
    }
  }

  return null;
};


const decorateApplicantFromSummary = (applicant, summary) => {
  applicant.id = summary.id;
  applicant.firstName = summary.firstName;
  applicant.lastName = summary.lastName;
  applicant.email = summary.email;
  applicant.location = {};
  if (summary.location != null) {
    applicant.location.country = summary.location.country;
    applicant.location.city = summary.location.city;
  }
  applicant.primaryAssignment = {};
  applicant.primaryAssignment.job = {};
  applicant.primaryAssignment.job.id = summary.primaryAssignment.job.id;
};


const decorateApplicantSummaryWithDetails = (applicant, detail) => {
  console.log('Trying to populate applicant detail stuff from this (should be a detail)', detail);
  // A bit ugly.  A better way.
  const det = detail.content[0];
  applicant.phoneNumber = det.phoneNumber;
  applicant.experience = {};

  if (det.experience != null) {
    const experience = det.experience[0];
    if (experience != null) {
      applicant.experience = {};
      applicant.experience.location = experience.location;
    }
  }
};


const processCandidateDetails = (candidateDetails, applicantSummaries) => {
  for (const detail of candidateDetails) {
    const applicant = findApplicant(applicantSummaries, detail.candidateDetails.content[0].id);

    if (applicant != null) {
      decorateApplicantSummaryWithDetails(applicant, detail.candidateDetails);
    } else {
      console.log(`Unable to find candidate id in master list of candidates: 
      ${JSON.stringify(detail.candidateDetails.content[0].id)}`);
    }
  }

  return applicantSummaries;
};


const createApplicantsFromSummaries = (candidateSummaries) => {
  const applicants = [];

  for (const summary of candidateSummaries) {
    const applicant = {};
    decorateApplicantFromSummary(applicant, summary);
    applicants.push(applicant);
  }

  return applicants;
};

module.exports = { createApplicantsFromSummaries, processCandidateDetails };
