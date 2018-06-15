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

  it('calls SAP for each FTE Applicant from SmartRecruiters, and registers Employee ID in SmartRecruiters', async () => {
    const fteApplicant1 = {
      id: 'guid1',
      employeeId: null,
      lastName: 'One',
      firstName: 'Applicant',
      other: 'Other',
      fullTime: true,
      primaryAssignment: {
        job: {
          id: 'job1'
        }
      }
    };
    const fteApplicant2 = {
      id: 'guid2',
      employeeId: null,
      lastName: 'Two',
      firstName: 'Applicant',
      other: 'Other',
      fullTime: true,
      primaryAssignment: {
        job: {
          id: 'job2'
        }
      }
    };
    const fteApplicant3 = {
      id: 'guid3',
      employeeId: null,
      lastName: 'Three',
      firstName: 'Applicant',
      other: 'Other',
      fullTime: true,
      primaryAssignment: {
        job: {
          id: 'job3'
        }
      }
    };
    const contractorApplicant = {
      id: 'guid4',
      employeeId: null,
      lastName: 'Four',
      firstName: 'Contractor Applicant',
      other: 'Other',
      fullTime: false
    };
    const alreadyIntroducedApplicant = {
      id: 'guid5',
      employeeId: 12345,
      lastName: 'Five',
      firstName: 'Already Introduced',
      other: 'Other',
      fullTime: true
    };
    const applicants = [fteApplicant1, contractorApplicant, fteApplicant2, alreadyIntroducedApplicant, fteApplicant3];

    smartrecruiters.getApplicants.mockResolvedValueOnce(applicants);

    util.generateResumeNumber.mockReturnValueOnce(1111);
    sap.postApplicant.mockReturnValueOnce(1010101);
    smartrecruiters.addEmployeeId.mockReturnValueOnce(true);

    util.generateResumeNumber.mockReturnValueOnce(2222);
    sap.postApplicant.mockReturnValueOnce(2020202);
    smartrecruiters.addEmployeeId.mockReturnValueOnce(true);

    // Error case.  Need to handle in a more detailed way.
    util.generateResumeNumber.mockReturnValueOnce(3333);
    sap.postApplicant.mockReturnValueOnce(null);
    smartrecruiters.addEmployeeId.mockReturnValueOnce(false);

    const results = await introduction.process();

    expect(util.generateResumeNumber)
      .toHaveBeenCalledTimes(3);

    expect(sap.postApplicant).toHaveBeenCalledWith(fteApplicant1, 1111);
    expect(sap.postApplicant).toHaveBeenCalledWith(fteApplicant2, 2222);
    expect(sap.postApplicant).toHaveBeenCalledWith(fteApplicant3, 3333);
    expect(sap.postApplicant).toHaveBeenCalledTimes(3);

    expect(results.processedApplicants.length)
      .toBe(applicants.length - 2); // Contractors and already-introduced applicants are not processed

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

