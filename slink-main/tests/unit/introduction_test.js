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

  it('calls SAP for each fteApplicant from SmartRecruiters', async () => {
    const fteApplicant1 = {
      id: 'guid1',
      lastName: 'One',
      firstName: 'Applicant',
      other: 'Other',
      fullTime: true
    };
    const fteApplicant2 = {
      id: 'guid2',
      lastName: 'Two',
      firstName: 'Applicant',
      other: 'Other',
      fullTime: true
    };
    const fteApplicant3 = {
      id: 'guid3',
      lastName: 'Three',
      firstName: 'Applicant',
      other: 'Other',
      fullTime: true
    };
    const contractorApplicant = {
      id: 'guid4',
      lastName: 'Four',
      firstName: 'Contractor Applicant',
      other: 'Other',
      fullTime: false
    };
    const applicants = [fteApplicant1, contractorApplicant, fteApplicant2, fteApplicant3];

    smartrecruiters.getApplicants.mockResolvedValueOnce(applicants);

    util.generateResumeNumber.mockReturnValueOnce(1111);
    sap.postApplicant.mockReturnValueOnce(1010101);

    util.generateResumeNumber.mockReturnValueOnce(2222);
    sap.postApplicant.mockReturnValueOnce(2020202);

    // Error case.  Need to handle in a more detailed way.
    util.generateResumeNumber.mockReturnValueOnce(3333);
    sap.postApplicant.mockReturnValueOnce(null);

    const results = await introduction.process();

    expect(util.generateResumeNumber).toHaveBeenCalledTimes(3);

    expect(sap.postApplicant).toHaveBeenCalledWith(fteApplicant1, 1111);
    expect(sap.postApplicant).toHaveBeenCalledWith(fteApplicant2, 2222);
    expect(sap.postApplicant).toHaveBeenCalledWith(fteApplicant3, 3333);
    expect(sap.postApplicant).toHaveBeenCalledTimes(3);

    expect(results.processedApplicants.length).toBe(3); // A contractor is not processed

    const result1 = {
      applicant: Object.assign(util.sanitizeApplicant(fteApplicant1), { employeeId: 1010101 }),
      status: 'Succeeded'
    };
    const result2 = {
      applicant: Object.assign(util.sanitizeApplicant(fteApplicant2), { employeeId: 2020202 }),
      status: 'Succeeded'
    };
    const result3 = {
      applicant: util.sanitizeApplicant(fteApplicant3),
      status: 'Failed'
    };
    expect(results.processedApplicants)
      .toEqual([result1, result2, result3]);
  });
});

