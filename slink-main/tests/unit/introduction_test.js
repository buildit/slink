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
    const successApplicant1 = {
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
    const successApplicant2 = {
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
    const sapFailApplicant = {
      id: 'guid3',
      employeeId: null,
      lastName: 'Three',
      firstName: 'SAP Employee ID Failure',
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
      fullTime: false
    };
    const alreadyIntroducedApplicant = {
      id: 'guid5',
      employeeId: 12345,
      lastName: 'Five',
      firstName: 'Already Introduced',
      fullTime: true
    };
    const srFailApplicant = {
      id: 'guid6',
      employeeId: null,
      lastName: 'Six',
      firstName: 'SR Store Employee ID Fail',
      other: 'Other',
      fullTime: true,
      primaryAssignment: {
        job: {
          id: 'job6'
        }
      }
    };

    const applicants = [
      successApplicant1,
      contractorApplicant,
      srFailApplicant,
      successApplicant2,
      alreadyIntroducedApplicant,
      sapFailApplicant
    ];

    smartrecruiters.getApplicants.mockResolvedValueOnce(applicants);

    util.generateResumeNumber.mockReturnValueOnce(1111);
    sap.postApplicant.mockReturnValueOnce(1010101);
    smartrecruiters.storeEmployeeId.mockReturnValueOnce(true);

    util.generateResumeNumber.mockReturnValueOnce(6666);
    sap.postApplicant.mockReturnValueOnce(6060606);
    smartrecruiters.storeEmployeeId.mockReturnValueOnce(false);

    util.generateResumeNumber.mockReturnValueOnce(2222);
    sap.postApplicant.mockReturnValueOnce(2020202);
    smartrecruiters.storeEmployeeId.mockReturnValueOnce(true);

    // Error case.  Need to handle in a more detailed way.
    util.generateResumeNumber.mockReturnValueOnce(3333);
    sap.postApplicant.mockReturnValueOnce(null);

    const results = await introduction.process();

    expect(util.generateResumeNumber).toHaveBeenCalledTimes(4);

    expect(sap.postApplicant).toHaveBeenCalledWith(successApplicant1, 1111);
    expect(sap.postApplicant).toHaveBeenCalledWith(srFailApplicant, 6666);
    expect(sap.postApplicant).toHaveBeenCalledWith(successApplicant2, 2222);
    expect(sap.postApplicant).toHaveBeenCalledWith(sapFailApplicant, 3333);
    expect(sap.postApplicant).toHaveBeenCalledTimes(4);

    expect(smartrecruiters.storeEmployeeId).not.toHaveBeenCalledWith(3333, 'job3', null);

    expect(results.applicantsIntroducedToSap.length)
      .toBe(applicants.length - 2); // Contractors and already-introduced applicants are not processed

    const successResult1 = {
      applicant: Object.assign(util.sanitizeApplicant(successApplicant1), { employeeId: 1010101 }),
      status: 'Succeeded'
    };
    const successResult2 = {
      applicant: Object.assign(util.sanitizeApplicant(successApplicant2), { employeeId: 2020202 }),
      status: 'Succeeded'
    };
    const sapFailResult = {
      applicant: util.sanitizeApplicant(sapFailApplicant),
      status: 'Failed',
      reason: 'SAP post failure'
    };
    const srFailResult = {
      applicant: Object.assign(util.sanitizeApplicant(srFailApplicant), { employeeId: 6060606 }),
      status: 'Failed',
      reason: 'SR post failure'
    };
    expect(results.applicantsIntroducedToSap)
      .toEqual([successResult1, srFailResult, successResult2, sapFailResult]);
  });
});

