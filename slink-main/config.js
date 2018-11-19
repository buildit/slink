'use strict';

const log = require('./log');
const {
  LOG_WARN,
  LOG_ERROR,
  AWS_DEFAULT_REGION
} = require('./constants');

const aws = require('./aws');

const localParams = {
  SAP_ADD_EMPLOYEE_URL: {
    name: 'sap/ADD_EMPLOYEE_URL',
    value: undefined
  },
  SAP_ACTIVATE_EMPLOYEE_URL: {
    name: 'sap/ACTIVATE_EMPLOYEE_URL',
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
 * Loads the configuration parameters from AWS Parameter Store.<br/>
 * It uses the Lambda ALIAS to determine which parameters to load (STAGE or PROD).<br/>
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

  // Get the AWS region from the environment variable which gets created automatically by AWS
  let awsRegion = process.env.AWS_DEFAULT_REGION;

  // the environment doesn't know which AWS region we are running in so default it to us-east-1
  if (awsRegion === undefined) {
    awsRegion = AWS_DEFAULT_REGION;
    log(LOG_WARN, `#### Defaulting to ${awsRegion} region for AWS API calls`);
  }

  try {
    const ssmParams = await aws.getParams(paramPath);
    // log(LOG_INFO, `SSM Params: ${JSON.stringify(ssmParams)}`);

    // Load all param values in our configParams list
    const keys = Object.keys(localParams);
    keys.forEach((configParamKey) => {
      const configParam = localParams[configParamKey];
      const paramFound = ssmParams.filter(p => p.Name.includes(configParam.name));
      if (paramFound !== undefined && paramFound.length === 1) {
        configParam.value = paramFound[0].Value;
      } else {
        // We didn't find something here so its best to throw an exception and stop
        throw new Error(`Configuration value not found in SSM Parameter Store for: ${paramPath}/${configParam.name}`);
      }
    });

    // Jam in LAMBDA_ALIAS so that other code can access it if needed
    localParams.LAMBDA_ALIAS = { value: alias };
    return localParams;
  } catch (e) {
    log(LOG_ERROR, `Problem accessing SSM parameters for ${paramPath}`, e);
    return null;
  }
};

module.exports = {
  loadConfigParams,
  params: localParams
};
