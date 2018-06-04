'use strict';

const findCandidate = (candidateList, candidateId) => {
  for (const candidate of candidateList) {
    if (candidate.id === candidateId) {
      return candidate;
    }
  }

  return null;
};


const decorateModelFromSummary = (candidate, summary) => {
  candidate.id = summary.id;
  candidate.firstName = summary.firstName;
  candidate.lastName = summary.lastName;
  candidate.email = summary.email;
  candidate.location = {};
  if (summary.location != null) {
    candidate.location.country = summary.location.country;
    candidate.location.city = summary.location.city;
  }
  candidate.primaryAssignment = {};
  candidate.primaryAssignment.job = {};
  candidate.primaryAssignment.job.id = summary.primaryAssignment.job.id;
};


const decorateModelFromDetails = (candidate, details) => {
  candidate.phoneNumber = details.phoneNumber;
  candidate.experience = {};

  if (details.experience != null) {
    const experience = details.experience[0];
    if (experience != null) {
      candidate.experience = {};
      candidate.experience.location = experience.location;
    }
  }
};


const processRawDetails = (detailsList, applicantsList) => {
  for (const detailRec of detailsList) {
    const candidate = findCandidate(applicantsList, detailRec.candidateDetails.id);

    if (candidate != null) {
      decorateModelFromDetails(candidate, detailRec.candidateDetails);
    } else {
      console.log(`Unable to find candidate id in master list of candidates: ${JSON.stringify(detailRec.candidateDetails.id)}`);
    }
  }

  return applicantsList;
};


const processRawSummaries = (rawSummaries) => {
  const candidateList = [];

  for (const summary of rawSummaries) {
    const candidate = {};
    decorateModelFromSummary(candidate, summary);
    candidateList.push(candidate);
  }

  return candidateList;
};

module.exports = { processRawSummaries, processRawDetails };
