'use strict';

const SAP_BACKEND_TIMEOUT_THRESHOLD = 4000;
const SAP_BACKEND_DOWN_EXCEPTION = 'SAP BACKEND DOWN';

const SAP_POST_FAILURE_RETRY_THRESHOLD = 5;

const LOG_INFO = 'INFO';
const LOG_DEBUG = 'DEBUG';
const LOG_ERROR = 'ERROR';
const LOG_WARN = 'WARN';

const STATUS_SKIPPED = 'Skipped';
const STATUS_SUCCESS = 'Succeeded';
const STATUS_FAILURE = 'Failed';

const REASON_ALREADY_ACTIVATED = 'Already activated';
const REASON_SAP_POST_FAILURE = 'SAP post failure';
const REASON_SR_POST_FAILURE = 'SR post failure';

const SR_OFFERED = 'OFFERED';
const SR_ONBOARDING = 'Onboarding';
const SR_OFFER_ACCEPTED = 'Offer Accepted';

const DYNAMO_DEFAULT_PORT = 8000;
const AWS_DEFAULT_REGION = 'us-east-1';

const SAP_DEFAULT_CHANGED_BY = '00001197';
const SAP_DEFAULT_ACTION = 'ACTIVE';
const SAP_DEFAULT_COMPANY = 'WT';
const SAP_DEFAULT_APPID = 'SR';
const SAP_DEFAULT_ZIPCODE = '40391';
const SAP_DEFAULT_STRING = 'NA';
const SAP_DEFAULT_MISSING_STRING = '';
const SAP_DEFAULT_SUCCESS_RESP = 'SUCCESS';
const SAP_DEFAULT_FAILURE_FLAGS = ['F'];
const SAP_DEFAULT_SUCCESS_FLAGS = ['T', 'S'];

module.exports = {
  LOG_INFO,
  LOG_DEBUG,
  LOG_ERROR,
  LOG_WARN,
  STATUS_SKIPPED,
  STATUS_SUCCESS,
  STATUS_FAILURE,
  REASON_ALREADY_ACTIVATED,
  REASON_SAP_POST_FAILURE,
  REASON_SR_POST_FAILURE,
  SR_OFFERED,
  SR_ONBOARDING,
  SR_OFFER_ACCEPTED,
  DYNAMO_DEFAULT_PORT,
  AWS_DEFAULT_REGION,
  SAP_DEFAULT_CHANGED_BY,
  SAP_DEFAULT_ACTION,
  SAP_DEFAULT_COMPANY,
  SAP_DEFAULT_APPID,
  SAP_DEFAULT_ZIPCODE,
  SAP_DEFAULT_STRING,
  SAP_DEFAULT_MISSING_STRING,
  SAP_DEFAULT_SUCCESS_RESP,
  SAP_DEFAULT_FAILURE_FLAGS,
  SAP_DEFAULT_SUCCESS_FLAGS,
  SAP_BACKEND_TIMEOUT_THRESHOLD,
  SAP_BACKEND_DOWN_EXCEPTION,
  SAP_POST_FAILURE_RETRY_THRESHOLD
};
