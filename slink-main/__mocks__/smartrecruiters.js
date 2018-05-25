'use strict';

let willReturnSuccessResult = true;
const setWillReturnSuccessResult = (returnSuccessResult) => {
  willReturnSuccessResult = returnSuccessResult;
};

const getCandidateSummaries = () => {
  const result = new Promise((resolve, reject) => {
    if (willReturnSuccessResult) {
      resolve({
        message: 'Mock Candidate found',
        count: 1
      });
    }
    else {
      reject(new Error('Error on get candidate summary'));
    }
  });
  return result;
};


module.exports = { setWillReturnSuccessResult, getCandidateSummaries };
