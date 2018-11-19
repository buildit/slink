'use strict';

// const introduction = require('../../introduction');

const sapActivateEmployee = require('../../sap/activateemployee');
const activationsDao = require('../../dao/activationsdao');
const smartrecruiters = require('../../smartrecruiters');
const activation = require('../../activation');
const util = require('../../util');

jest.mock('../../smartrecruiters');
jest.mock('../../sap/activateemployee');
jest.mock('../../dao/activationsdao');

util.generateResumeNumber = jest.fn();

describe('Applicant activation process', () => {
  beforeEach(() => {
    smartrecruiters.getApplicants.mockClear();
    sapActivateEmployee.execute.mockClear();
    activationsDao.write.mockClear();
    activationsDao.read.mockClear();
  });

  it('calls SAP for each FTE Applicant from SmartRecruiters, and activates each Employee', async () => {
    const successApplicant1 = {
      id: 'successGuid1',
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
      id: 'successGuid2',
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
      id: 'sapFailGuid',
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
      id: 'contractorGuid',
      employeeId: 1003,
      lastName: 'Four',
      firstName: 'Contractor Applicant',
      fullTime: false
    };
    const alreadyActivatedApplicant = {
      id: 'alreadyActivatedGuid',
      employeeId: 1005,
      lastName: 'Five',
      firstName: 'Activated Applicant',
      fullTime: true
    };

    const applicants = [
      successApplicant1,
      contractorApplicant,
      successApplicant2,
      noEmployeeIdCandidate,
      sapFailApplicant,
      alreadyActivatedApplicant
    ];

    smartrecruiters.getApplicants.mockResolvedValueOnce(applicants);

    const activationItem = {
      someProperty: 'someValue'
    };
    activationsDao.read.mockReturnValueOnce({});
    sapActivateEmployee.execute.mockReturnValueOnce(true);
    activationsDao.read.mockReturnValueOnce({});
    sapActivateEmployee.execute.mockReturnValueOnce(true);
    activationsDao.read.mockReturnValueOnce({});
    sapActivateEmployee.execute.mockReturnValueOnce(false);
    activationsDao.read.mockReturnValueOnce(activationItem);

    const results = await activation.process();
    console.log(results);

    expect(smartrecruiters.getApplicants).toHaveBeenCalledWith('OFFERED', 'Onboarding');

    expect(sapActivateEmployee.execute).toHaveBeenCalledWith(successApplicant1);
    expect(sapActivateEmployee.execute).toHaveBeenCalledWith(successApplicant2);
    expect(sapActivateEmployee.execute).toHaveBeenCalledWith(sapFailApplicant);

    expect(activationsDao.write)
      .toHaveBeenCalledWith({ srCandidateId: 'successGuid1', sapEmployeeId: 1000 });
    expect(activationsDao.write)
      .toHaveBeenCalledWith({ srCandidateId: 'successGuid2', sapEmployeeId: 1001 });

    expect(sapActivateEmployee.execute).toHaveBeenCalledTimes(3);
    expect(activationsDao.write).toHaveBeenCalledTimes(2);

    expect(results.attempted)
      .toBe(applicants.length - [noEmployeeIdCandidate, contractorApplicant, alreadyActivatedApplicant].length);

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
    const skippedResult = {
      applicant: util.sanitizeApplicant(alreadyActivatedApplicant),
      status: 'Skipped',
      reason: 'Already activated'
    };

    expect(results.successfulApplicants)
      .toEqual([successResult1, successResult2]);

    expect(results.unsuccessfulApplicants)
      .toEqual([sapFailResult]);

    expect(results.skippedApplicants)
      .toEqual([skippedResult]);
  });
});

