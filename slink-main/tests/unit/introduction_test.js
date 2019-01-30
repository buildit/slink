'use strict';

const {
  SAP_POST_FAILURE_RETRY_THRESHOLD
} = require('../../constants');

const sapAddEmployee = require('../../sap/addemployee');
const introductionsDao = require('../../dao/introductionsdao');
const smartrecruiters = require('../../smartrecruiters');
const introduction = require('../../introduction');
const util = require('../../util');

jest.mock('../../smartrecruiters');
jest.mock('../../sap/addemployee');
jest.mock('../../dao/introductionsdao');

util.generateResumeNumber = jest.fn();

describe('Applicant introduction process', () => {
  beforeEach(() => {
    smartrecruiters.getApplicants.mockClear();
    sapAddEmployee.execute.mockClear();
    introductionsDao.write.mockClear();
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
    sapAddEmployee.execute.mockReturnValueOnce({ EmployeeId: 1010101, ReturnMessage: '' });
    smartrecruiters.storeEmployeeId.mockReturnValueOnce(true);

    util.generateResumeNumber.mockReturnValueOnce(6666);
    sapAddEmployee.execute.mockReturnValueOnce({ EmployeeId: 6060606, ReturnMessage: '' });
    smartrecruiters.storeEmployeeId.mockReturnValueOnce(false);

    util.generateResumeNumber.mockReturnValueOnce(2222);
    sapAddEmployee.execute.mockReturnValueOnce({ EmployeeId: 2020202, ReturnMessage: '' });
    smartrecruiters.storeEmployeeId.mockReturnValueOnce(true);

    // Error case.  Need to handle in a more detailed way.
    util.generateResumeNumber.mockReturnValueOnce(3333);
    sapAddEmployee.execute.mockReturnValueOnce(null);

    util.generateResumeNumber.mockReturnValue(9999);

    for (let i = 0; i < (SAP_POST_FAILURE_RETRY_THRESHOLD * 2) - 1; i += 1) {
      sapAddEmployee.execute.mockReturnValueOnce({ EmployeeId: 6060606, ReturnMessage: '' });
    }
    sapAddEmployee.execute.mockReturnValueOnce(null);

    const results = await introduction.process();

    expect(smartrecruiters.getApplicants).toHaveBeenCalledWith('OFFERED', 'Offer Accepted');

    expect(util.generateResumeNumber).toHaveBeenCalledTimes(4
                                                          + (SAP_POST_FAILURE_RETRY_THRESHOLD * results.unsuccessful));

    expect(sapAddEmployee.execute).toHaveBeenCalledWith(successApplicant1, 1111);
    expect(sapAddEmployee.execute).toHaveBeenCalledWith(srFailApplicant, 6666);
    expect(sapAddEmployee.execute).toHaveBeenCalledWith(successApplicant2, 2222);
    expect(sapAddEmployee.execute).toHaveBeenCalledWith(sapFailApplicant, 3333);

    expect(introductionsDao.write).toHaveBeenCalledWith({ srCandidateId: 'guid1', slinkResumeNumber: 1111, sapEmployeeId: 1010101 });
    expect(introductionsDao.write).toHaveBeenCalledWith({ srCandidateId: 'guid2', slinkResumeNumber: 2222, sapEmployeeId: 2020202 });

    expect(sapAddEmployee.execute).toHaveBeenCalledTimes(4
                                                       + (SAP_POST_FAILURE_RETRY_THRESHOLD * results.unsuccessful));
    /* -1 because one sap failure, first trials: 4, retry: 3*2, -1 */
    expect(introductionsDao.write).toHaveBeenCalledTimes(2
                                                       + (SAP_POST_FAILURE_RETRY_THRESHOLD * results.unsuccessful));

    expect(smartrecruiters.storeEmployeeId).not.toHaveBeenCalledWith(3333, 'job3', null);

    expect(results.attempted)
      .toBe(applicants.length - 2); // Contractors and already-introduced applicants are not processed

    expect(results.successful)
      .toBe(2);

    expect(results.unsuccessful)
      .toBe(2);

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
      reason: 'SAP post failure',
      message: 'Unexpected error check log for more details'
    };
    const srFailResult = {
      applicant: Object.assign(util.sanitizeApplicant(srFailApplicant), { employeeId: 6060606 }),
      status: 'Failed',
      reason: 'SR post failure'
    };

    expect(results.successfulApplicants)
      .toEqual([successResult1, successResult2]);

    expect(results.unsuccessfulApplicants)
      .toEqual([srFailResult, sapFailResult]);
  });
});
