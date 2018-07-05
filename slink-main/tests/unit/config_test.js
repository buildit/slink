'use strict';

const config = require('../../config.js');
const aws = require('../../aws.js');

jest.mock('../../aws.js');

describe('Handler invocation', () => {
  beforeEach(() => {
    aws.getParams.mockClear();
  });

  const context = {
    functionName: 'awscodestar-buildit-slink-lambda-SlinkMainFunction-ABBXZIYEV8GR',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:006393696278:function:awscodestar-buildit-slink-lambda-SlinkMainFunction-ABBXZIYEV8GR:STAGE'
  };

  const mockedAWSParamResult = {
    data: [
      {
        Name: '/slink/STAGE/sap/ADD_EMPLOYEE_URL',
        Value: 'https://appstore.wipro.com/synergy/AltRecruitService?opr=empIdGen'
      },
      {
        Name: '/slink/STAGE/sap/ACTIVATE_EMPLOYEE_URL',
        Value: 'https://appstore.wipro.com/services/rest/onboardHiring/proActiveEmployeeIdActivation'
      },
      {
        Name: '/slink/STAGE/sap/PASSWORD',
        Value: 'password'
      },
      {
        Name: '/slink/STAGE/sap/USERNAME',
        Value: 'username'
      },
      {
        Name: '/slink/STAGE/smartrecruiters/ADD_PROP_URL',
        Value: 'https://api.smartrecruiters.com/candidates/{candidateId}/jobs/{jobId}/properties/{propertyId}'
      },
      {
        Name: '/slink/STAGE/smartrecruiters/EMPLOYEE_PROP_ID',
        Value: '05f1b2eb-65f2-46c7-ad73-c7b8bd688c33'
      },
      {
        Name: '/slink/STAGE/smartrecruiters/JOB_PROPS_URL',
        Value: 'https://api.smartrecruiters.com/candidates/{candidateId}/jobs/{jobId}/properties'
      },
      {
        Name: '/slink/STAGE/smartrecruiters/SUMMARY_URL',
        Value: 'https://api.smartrecruiters.com/candidates?status=OFFERED&subStatus=Offer Accepted'
      },
      {
        Name: '/slink/STAGE/smartrecruiters/TOKEN',
        Value: 'xxxxxxxxxx'
      }
    ]
  };

  const mockedExpectedResult = {
    SAP_ADD_EMPLOYEE_URL: {
      name: 'sap/ADD_EMPLOYEE_URL',
      value: 'https://appstore.wipro.com/synergy/AltRecruitService?opr=empIdGen'
    },
    SAP_ACTIVATE_EMPLOYEE_URL: {
      name: 'sap/ACTIVATE_EMPLOYEE_URL',
      value: 'https://appstore.wipro.com/services/rest/onboardHiring/proActiveEmployeeIdActivation'
    },
    SAP_USERNAME: {
      name: 'sap/USERNAME',
      value: 'username'
    },
    SAP_PASSWORD: {
      name: 'sap/PASSWORD',
      value: 'password'
    },
    SR_ADD_PROP_URL: {
      name: 'smartrecruiters/ADD_PROP_URL',
      value: 'https://api.smartrecruiters.com/candidates/{candidateId}/jobs/{jobId}/properties/{propertyId}'
    },
    SR_EMPLOYEE_PROP_ID: {
      name: 'smartrecruiters/EMPLOYEE_PROP_ID',
      value: '05f1b2eb-65f2-46c7-ad73-c7b8bd688c33'
    },
    SR_JOB_PROPS_URL: {
      name: 'smartrecruiters/JOB_PROPS_URL',
      value: 'https://api.smartrecruiters.com/candidates/{candidateId}/jobs/{jobId}/properties'
    },
    SR_SUMMARY_URL: {
      name: 'smartrecruiters/SUMMARY_URL',
      value: 'https://api.smartrecruiters.com/candidates?status=OFFERED&subStatus=Offer Accepted'
    },
    SR_TOKEN: {
      name: 'smartrecruiters/TOKEN',
      value: 'xxxxxxxxxx'
    },
    LAMBDA_ALIAS: {
      value: 'STAGE'
    }
  };

  it('checks if all parameters are defined in AWS parameter store', async () => {
    aws.getParams.mockResolvedValue(mockedAWSParamResult.data);
    const configParams = await config.loadConfigParams(context);
    expect(configParams).toEqual(mockedExpectedResult);
  });

  it('throws an exception on failure', async () => {
    const error = new Error('Error from unit test (config_test)');
    aws.getParams.mockRejectedValue(error);
    return (config.loadConfigParams(context)).rejects;
  });
});
