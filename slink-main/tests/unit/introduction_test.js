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
    expect(sap.postApplicant).toBeCalledWith(applicant3, 3333);

    expect(results.processedApplicants.length).toBe(applicants.length);

    const result1 = {
      applicant: Object.assign(util.sanitizeApplicant(applicant1), { employeeId: 1010101 }),
      status: "Succeeded"
    };
    const result2 = {
      applicant: Object.assign(util.sanitizeApplicant(applicant2), { employeeId: 2020202 }),
      status: "Succeeded"
    };
    const result3 = {
      applicant: util.sanitizeApplicant(applicant3),
      status: "Failed"
    };
    expect(results.processedApplicants).toEqual([result1, result2, result3]);
  });
});

