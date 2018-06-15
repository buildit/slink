'use strict';

const smartrecruiters = require('../../smartrecruiters');

const applicantId = 'cc285818-963d-497a-a2a8-e2227af0876e';
const jobId = 'ccfc86f3-c309-48e2-a2ae-175ae0d0ec3c';
const employeeId = 'test-ccfc86f3-c309';

describe('Add & then delete/null out Employee Id property in SR', () => {
  beforeAll(() => {
    // process.env.SR_API_TOKEN = 'set me in the env';
    process.env.SR_EMPLOYEE_PROP_ID = '05f1b2eb-65f2-46c7-ad73-c7b8bd688c33';
    process.env.SR_ADD_PROPERTY_URL = 'https://api.smartrecruiters.com/candidates/{candidateId}/jobs/{jobId}/properties/{propertyId}';
  });

  beforeEach(() => {
  });

  it.skip('returns true when reset employee id is set\'', async () => {
    const result = await smartrecruiters.addEmployeeId(
      applicantId,
      jobId,
      employeeId
    );
    expect(result).toBe(true);
  });

  it.skip('returns true when reset employee id to null', async () => {
    const result = await smartrecruiters.addEmployeeId(
      applicantId,
      jobId,
      ''
    );
    expect(result).toBe(true);
  });
});

