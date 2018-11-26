'use strict';

const AWS = require('aws-sdk');
const log = require('./log');
const {
  LOG_INFO,
  LOG_ERROR,
  AWS_DEFAULT_REGION
} = require('./constants');

/**
 * Function for seding notification using AWS SNS
 * @param {...string} List of strings which is required for notification body
 * @return { null }
 */
function notification(subject, ...msg) {
  let _msg = '';
  msg.forEach((m) => {
    _msg += m;
  });
  AWS.config.update({ region: AWS_DEFAULT_REGION });
  const sns = new AWS.SNS();
  let topic = null;
  const topicSearchString = 'slink';
  sns.listTopics({}, (err, data) => {
    if (err) {
      log(LOG_ERROR, `Error while fetching topics ${err.stack}`);
    } else {
      /* TODO: Removing hardcoded slink, find some other logic */
      topic = data.Topics.filter(item => item.TopicArn.search(topicSearchString) !== -1);
      if (topic[0] === undefined) {
        log(LOG_ERROR, `Error while searching topic with string ${topicSearchString}`);
      } else {
        const topicArn = topic[0].TopicArn;
        const params = { Message: _msg, TopicArn: topicArn, Subject: subject };
        const publishPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();
        publishPromise.then((_data) => {
          log(LOG_INFO, `Message is sent to topic ${params.TopicArn} with id: ${_data.MessageId} and message is ${params.Message}`);
        }).catch((_err) => {
          log(LOG_ERROR, `Error occured while sending message to SNS: ${_err.stack}`);
        });
      }
    }
  });
}

module.exports = notification;
