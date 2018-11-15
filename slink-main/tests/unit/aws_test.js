'use strict';

const aws = require('../../aws');
jest.unmock('aws-sdk');
/* jest.unmock('aws-param-store'); */

const AWS = require.requireActual('aws-sdk');
const awsParamStore = require('aws-param-store');

describe('AWS DAO test', () => {
  it('Put item to dynamodb', () => {
    const mock = AWS.DynamoDB.DocumentClient = jest.fn(cb => {
      return {
	put: jest.fn(cb => {
	  return {
	    promise: jest.fn()
	  };
	})
      }
    });
    process.env.LOCAL_DYNAMO_IP = '';
    aws.putDynamoDbItem({});
    expect(mock).toHaveBeenCalled();
  });

  it('Put item to dynamodb', () => {
    const mock = AWS.DynamoDB = jest.fn(cb => {
      return {
	getItem: jest.fn(cb => {
	  return {
	    promise: jest.fn()
	  };
	})
      }
    });
    process.env.LOCAL_DYNAMO_IP = '';
    aws.getDynamoDbItem({});
    expect(mock).toHaveBeenCalled();
  });

  it('Should fetch param from param store', () => {
    /* const mock = awsParamStore = jest.fn(cb => {
     *   return {
       getParametersByPath: jest.fn()
     *   }      
     * }); */
    const spy = jest.spyOn(awsParamStore, 'getParametersByPath');
    aws.getParams('', '');
    expect(spy).toHaveBeenCalled();
  });
})


/* test('random should be 1', () => {
 *   // mock lodash random to return the value 1 in first test
 *   lodash.random = jest.fn(() => 1);
 *   expect(myModule.testRandomMock(1)).toBe(1);
 * });
 * 
 * test('random should be 2', () => {
 *   // mock lodash random to return the value 2 in second test
 *   lodash.random = jest.fn(() => 2);
 *   expect(myModule.testRandomMock(2)).toBe(2);
 * }); */
