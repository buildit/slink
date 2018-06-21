'use strict';

const awsParamStore = require('aws-param-store');

const configParams = {
  SAP_ADD_EMPLOYEE_URL: {
    name: 'sap/ADD_EMPLOYEE_URL',
    value: undefined
  },
  SAP_USERNAME: {
    name: 'sap/USERNAME',
    value: undefined
  },
  SAP_PASSWORD: {
    name: 'sap/PASSWORD',
    value: undefined
  },
  SR_ADD_PROP_URL: {
    name: 'smartrecruiters/ADD_PROP_URL',
    value: undefined
  },
  SR_EMPLOYEE_PROP_ID: {
    name: 'smartrecruiters/EMPLOYEE_PROP_ID',
    value: undefined
  },
  SR_JOB_PROPS_URL: {
    name: 'smartrecruiters/JOB_PROPS_URL',
    value: undefined
  },
  SR_SUMMARY_URL: {
    name: 'smartrecruiters/SUMMARY_URL',
    value: undefined
  },
  SR_TOKEN: {
    name: 'smartrecruiters/TOKEN',
    value: undefined
  }
};

/**
 * Helper function to call AWS API to retrieve parameter values
 * Extracting this call in its own function also helps in mocking tests
 * @param paramPath
 * @returns Parameter keys/values raw JSON
 */
const getAWSParams = async (paramPath) => {
  // Get the AWS region from the environment variable which gets created automatically by AWS
  let awsRegion = process.env.AWS_DEFAULT_REGION;

  // the environment doesn't know which AWS region we are running in so default it to us-east-1
  if (awsRegion === undefined) {
    awsRegion = 'us-east-1';
  }

  const parameters = await awsParamStore.getParametersByPath(paramPath, { region: awsRegion });
  return parameters;
};

// This is an awful work around to mocking a single function using jest!!
// Apparently mocking a single function in a module doesn't work!
const lib = {
  getAWSParams,
};

/**
 * Loads the configuration paramaters from AWS Parameter Store.<br/>
 * It uses the Lambda ALIAS to determine which paramaters to load (STAGE or PROD).<br/>
 * In order for this work correctly, we must ensure that the Lambda functions have aliases assigned
 * to a specific version.<br/>
 *
 * @returns {} JSON with all the parameters for the current environment/alias
 */
const loadConfigParams = async (context) => {
  const functionName = { context };
  const functionArn = context.invokedFunctionArn;

  let alias = functionArn.split(':').pop();

  // the ARN doesn't include an alias token, therefore we must be executing $LATEST
  if (alias === functionName) {
    alias = 'LATEST';
  } else if (alias === 'test') {
    // If running locally, AWS automatically sets alias to 'test' so we will change it to STAGE for testing purposes
    alias = 'STAGE';
  }

  const paramPath = `/slink/${alias}`;

  const parameters = await lib.getAWSParams(paramPath);
  // console.log(`SSM Params: ${JSON.stringify(parameters)}`);

  // Load all param values in our configParams list
  const keys = Object.keys(configParams);
  keys.forEach((configParamKey) => {
    const configParam = configParams[configParamKey];
    const paramFound = parameters.filter(p => p.Name.includes(configParam.name));
    if (paramFound !== undefined && paramFound.length === 1) {
      configParam.value = paramFound[0].Value;
    } else {
      // We didn't find something here so its best to throw an exception and stop
      throw new Error(`Configuration value not found in SSM Parameter Store for: ${paramPath}/${configParam.name}`);
    }
  });

  return configParams;
};

module.exports = {
  loadConfigParams,
  lib,
  configParams
};
