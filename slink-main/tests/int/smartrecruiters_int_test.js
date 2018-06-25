'use strict';

const smartrecruiters = require('../../smartrecruiters');
const config = require('../../config');

const applicantId = 'cc285818-963d-497a-a2a8-e2227af0876e';
const jobId = 'ccfc86f3-c309-48e2-a2ae-175ae0d0ec3c';
const employeeId = 'test-ccfc86f3-c309';

describe('Add & then delete/null out Employee Id property in SR', () => {
  beforeAll(() => {
    config.params.SR_EMPLOYEE_PROP_ID.value = '05f1b2eb-65f2-46c7-ad73-c7b8bd688c33';
    config.params.SR_JOB_PROPS_URL.value = 'https://api.smartrecruiters.com/candidates/{candidateId}/jobs/{jobId}/properties/{propertyId}';
  });

  beforeEach(() => {
  });

  it.skip('returns true when reset employee id is set\'', async () => {
    const result = await smartrecruiters.storeEmployeeId(
      applicantId,
      jobId,
      employeeId
    );
    expect(result).toBe(true);
  });

  it.skip('returns true when reset employee id to null', async () => {
    const result = await smartrecruiters.storeEmployeeId(
      applicantId,
      jobId,
      ''
    );
    expect(result).toBe(true);
  });
});

