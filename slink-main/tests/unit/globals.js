'use strict';

const notification = require('../../notification');

jest.mock('../../notification');

notification.mockImplementation(() => {});
