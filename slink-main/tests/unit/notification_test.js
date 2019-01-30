'use strict';

const log = require('../../log');
const AWS = require('aws-sdk');

jest.unmock('../../notification');
jest.mock('aws-sdk');
jest.mock('../../log');
const notification = require('../../notification');

const {
  LOG_ERROR,
  AWS_DEFAULT_REGION
} = require('../../constants');

describe('Notification test', () => {
  beforeEach(() => {
    const listTopics = { listTopics: jest.fn((e, cb) => cb({ stack: null }, '')) };
    AWS.SNS.mockImplementation(() => listTopics);
    AWS.config.update.mockImplementation(() => {});
  });

  it('Should update config', () => {
    AWS.config.update.mockImplementation(() => {});
    log.mockImplementation(() => {});
    notification('', '');
    expect(AWS.config.update).toHaveBeenCalledWith({ region: AWS_DEFAULT_REGION });
  });

  it('Should call constructor', () => {
    notification('', '');
    expect(AWS.SNS).toHaveBeenCalled();
  });

  it('Should call list topics after object creation ', () => {
    AWS.SNS.mockClear();
    const spy = jest.fn((e, cb) => {
      cb({ stack: null }, '');
    });
    const listTopics = { listTopics: spy };
    AWS.SNS.mockImplementation(() => listTopics);
    notification('', '');
    expect(spy).toHaveBeenCalled();
  });

  it('Should call log in case of error in list topics', () => {
    notification('', '');
    expect(log).toHaveBeenCalledWith(LOG_ERROR, 'Error while fetching topics null');
  });

  it('Should log incase of error in topic after search', () => {
    AWS.SNS.mockClear();
    const listTopicsMock = {
      listTopics: jest.fn((e, cb) => {
        const mockData = {
          Topics: [{ TopicArn: 'abc' }]
        };
        cb(null, mockData);
      })
    };
    AWS.SNS.mockImplementation(() => listTopicsMock);
    notification('', '');
    expect(log).toHaveBeenCalledWith(LOG_ERROR, 'Error while searching topic with string slink');
  });


  it('Should call catch block in case of promise error', () => {
    AWS.SNS.mockClear();
    const listTopicsMock = {
      listTopics: jest.fn((e, cb) => {
        const mockData = {
          Topics: [{ TopicArn: 'slink' }]
        };
        cb(null, mockData);
      })
    };
    AWS.SNS.mockImplementationOnce(() => listTopicsMock);
    const error = new Error(null);
    const promise = new Promise((resolve, reject) => reject(error));
    const catchMock = jest.fn();
    const catchMockResult = {
      catch: catchMock
    };
    promise.then = jest.fn(() => catchMockResult);
    const promiseMock = jest.fn(() => promise);
    const promiseResult = {
      promise: promiseMock
    };
    const publishPromiseMock = jest.fn(() => promiseResult);
    const publishResult = {
      publish: publishPromiseMock
    };
    AWS.SNS.mockImplementationOnce(() => publishResult);
    notification('', '');
    expect(AWS.SNS).toHaveBeenCalledWith({ apiVersion: '2010-03-31' });
    expect(publishPromiseMock).toHaveBeenCalledWith({ Message: '', TopicArn: 'slink', Subject: '' });
    expect(promise.then).toHaveBeenCalled();
    expect(catchMock).toHaveBeenCalled();
  });

  it('Should call then for sending notification', () => {
    AWS.SNS.mockClear();
    const listTopicsMock = {
      listTopics: jest.fn((e, cb) => {
        const mockData = {
          Topics: [{ TopicArn: 'slink' }]
        };
        cb(null, mockData);
      })
    };
    AWS.SNS.mockImplementationOnce(() => listTopicsMock);
    const catchMock = jest.fn();
    const promise = new Promise(resolve => resolve({ MessageId: 1 }));
    promise.then = jest.fn(() => ({ catch: catchMock }));
    const promiseMock = jest.fn(() => promise);
    const publishPromiseMock = jest.fn(() => ({ promise: promiseMock }));
    AWS.SNS.mockImplementationOnce(() => ({ publish: publishPromiseMock }));
    notification('', '');
    expect(AWS.SNS).toHaveBeenCalledWith({ apiVersion: '2010-03-31' });
    expect(publishPromiseMock).toHaveBeenCalledWith({ Message: '', TopicArn: 'slink', Subject: '' });
    expect(promise.then).toHaveBeenCalled();
    expect(catchMock).toHaveBeenCalledTimes(1);
  });
});

