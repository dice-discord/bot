// Copyright Jonah Snider 2018

const { Signale } = require('signale');

// This is the base logger that all other logger instances are built on
const options = {
  stream: process.stdout,
  scope: 'logger',
  types: {
    command: {
      badge: '>',
      color: 'gray',
      label: 'command'
    },
    critical: {
      badge: '!!',
      color: 'red',
      label: 'critical'
    }
  }
};

const logger = new Signale(options);

logger.start('Custom Signale logger started');

module.exports = logger;
