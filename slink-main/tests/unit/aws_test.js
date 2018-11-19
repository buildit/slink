'use strict';

const aws = require('../../aws');

jest.unmock('aws-sdk');

const AWS = require.requireActual('aws-sdk');
const awsParamStore = require('aws-param-store');

describe('AWS DAO test', () => {
  it('Put item to dynamodb', () => {
    const mock = jest.fn();
    AWS.DynamoDB = {
      DocumentClient: function fx() {
        return { put: mock };
      }
    };
    process.env.LOCAL_DYNAMO_IP = '';
    aws.putDynamoDbItem({});
    expect(mock).toHaveBeenCalled();
  });

  it('Get item from dynamodb', () => {
    const mock = jest.fn();
    AWS.DynamoDB = function fx() {
      return {
        getItem: mock
      };
    };
    aws.getDynamoDbItem({});
    expect(mock).toHaveBeenCalled();
  });

  it('Should fetch param from param store', () => {
    const spy = jest.spyOn(awsParamStore, 'getParametersByPath');
    aws.getParams('', '');
    expect(spy).toHaveBeenCalled();
  });
});
