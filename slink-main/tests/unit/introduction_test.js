'use strict';

// const introduction = require('../../introduction');

const sap = require('../../sap');
const smartrecruiters = require('../../smartrecruiters');
const introduction = require('../../introduction');
const util = require('../../util');

jest.mock('../../smartrecruiters');
jest.mock('../../sap');
util.generateResumeNumber = jest.fn();

describe('Applicant introduction process', () => {
  beforeEach(() => {
    smartrecruiters.getApplicants.mockClear();
    sap.postApplicant.mockClear();
  });

  it('calls SAP for each applicant from SmartRecruiters', async () => {
    const applicant1 = { id: 'guid1', lastName: 'One', firstName: 'Applicant', other: 'Other' };
    const applicant2 = { id: 'guid2', lastName: 'Two', firstName: 'Applicant', other: 'Other' };
    const applicant3 = { id: 'guid3', lastName: 'Three', firstName: 'Applicant', other: 'Other' };
    const applicants = [applicant1, applicant2, applicant3];

    smartrecruiters.getApplicants.mockResolvedValueOnce(applicants);

    util.generateResumeNumber.mockReturnValueOnce(1111);
    sap.postApplicant.mockReturnValueOnce(1010101);

    util.generateResumeNumber.mockReturnValueOnce(2222);
    sap.postApplicant.mockReturnValueOnce(2020202);

    // Error case.  Need to handle in a more detailed way.
    util.generateResumeNumber.mockReturnValueOnce(3333);
    sap.postApplicant.mockReturnValueOnce(null);

    const results = await introduction.process();

    expect(sap.postApplicant).toBeCalledWith(applicant1, 1111);
    expect(sap.postApplicant).toBeCalledWith(applicant2, 2222);

    expect(results.successfulApplicants.length).toBe(applicants.length - 1);
    const result1 = Object.assign(util.secureApplicant(applicant1), { employeeId: 1010101 });
    const result2 = Object.assign(util.secureApplicant(applicant2), { employeeId: 2020202 });
    expect(results.successfulApplicants).toEqual([result1, result2]);
  });
});

