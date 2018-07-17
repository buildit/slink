'use strict';

// const introduction = require('../../introduction');

const sapActivateEmployee = require('../../sap/activateemployee');
const activationsDao = require('../../dao/activationsdao');
const smartrecruiters = require('../../smartrecruiters');
const activation = require('../../activation');
const util = require('../../util');

jest.mock('../../smartrecruiters');
jest.mock('../../sap/activateemployee');
jest.mock('../../dao/activationsdao')

util.generateResumeNumber = jest.fn();

describe('Applicant activation process', () => {
  beforeEach(() => {
    smartrecruiters.getApplicants.mockClear();
    sapActivateEmployee.execute.mockClear();
    activationsDao.write.mockClear();
  });

  it('calls SAP for each FTE Applicant from SmartRecruiters, and activates each Employee', async () => {
    const successApplicant1 = {
      id: 'guid1',
      employeeId: 1000,
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
      employeeId: 1001,
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
    const noEmployeeIdCandidate = {
      id: 'guidNoEmployeeId',
      employeeId: null,
      lastName: 'NoEmployee',
      firstName: 'ID',
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
      employeeId: 1002,
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
      employeeId: 1003,
      lastName: 'Four',
      firstName: 'Contractor Applicant',
      fullTime: false
    };

    const applicants = [
      successApplicant1,
      contractorApplicant,
      successApplicant2,
      noEmployeeIdCandidate,
      sapFailApplicant
    ];

    smartrecruiters.getApplicants.mockResolvedValueOnce(applicants);

    sapActivateEmployee.execute.mockReturnValueOnce(true);
    sapActivateEmployee.execute.mockReturnValueOnce(true);
    sapActivateEmployee.execute.mockReturnValueOnce(false);

    const results = await activation.process();

    expect(sapActivateEmployee.execute).toHaveBeenCalledWith(successApplicant1);
    expect(sapActivateEmployee.execute).toHaveBeenCalledWith(successApplicant2);
    expect(sapActivateEmployee.execute).toHaveBeenCalledWith(sapFailApplicant);

    expect(activationsDao.write)
      .toHaveBeenCalledWith({ srCandidateId: 'guid1', sapEmployeeId: 1000 });
    expect(activationsDao.write)
      .toHaveBeenCalledWith({ srCandidateId: 'guid2', sapEmployeeId: 1001 });

    expect(sapActivateEmployee.execute).toHaveBeenCalledTimes(3);
    expect(activationsDao.write).toHaveBeenCalledTimes(2);

    expect(results.attempted)
      .toBe(applicants.length - 2); // Contractors and already-introduced applicants are not processed

    expect(results.successful)
      .toBe(2);

    expect(results.unsuccessful)
      .toBe(1);

    const successResult1 = {
      applicant: util.sanitizeApplicant(successApplicant1),
      status: 'Succeeded'
    };
    const successResult2 = {
      applicant: util.sanitizeApplicant(successApplicant2),
      status: 'Succeeded'
    };
    const sapFailResult = {
      applicant: util.sanitizeApplicant(sapFailApplicant),
      status: 'Failed',
      reason: 'SAP post failure'
    };

    expect(results.successfulApplicants)
      .toEqual([successResult1, successResult2]);

    expect(results.unsuccessfulApplicants)
      .toEqual([sapFailResult]);
  });
});

