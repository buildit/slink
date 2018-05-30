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
  candidate.location.country = summary.location.country;
  candidate.location.city = summary.location.city;
  candidate.primaryAssinment = {};
  candidate.primaryAssinment.job = {};
  candidate.primaryAssinment.job.id = summary.primaryAssignment.job.id;
};


const decorateModelFromDetails = (candidate, details) => {
  candidate.phoneNumber = details.phoneNumber;
  candidate.experience = {};

  if (details.experience != null) {
    const experience = details.experience[0];
    candidate.experience.location = experience.location;
  }
};


const processRawDetails = (detailsList, candidatesList) => {
  for (const detailRec of detailsList) {
    const candidate = findCandidate(candidatesList, detailRec.candidateDetails.id);

    if (candidate != null) {
      decorateModelFromDetails(candidate, detailRec.candidateDetails);
    }
    else {
      console.log(`Unable to find candidate id in master list of candidates: ${JSON.stringify(detailRec.candidateDetails.id)}`);
    }
  }

  return candidatesList;
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
