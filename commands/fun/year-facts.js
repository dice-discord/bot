// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const rp = require('request-promise-native');
const logger = require('../../providers/logger').scope('command', 'year facts');

module.exports = class YearFactsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'year-facts',
      group: 'fun',
      memberName: 'year-facts',
      description: 'Get a fact about a year.',
      details: 'Not specifying the year to lookup will give you a random fact',
      aliases: ['year-fact', 'random-year-facts', 'random-year-fact'],
      examples: ['year-facts', 'year-facts 1969'],
      args: [{
        'key': 'year',
        'prompt': 'What year do you want to get facts for?',
        'type': 'integer',
        'default': 'random'
      }],
      throttling: {
        usages: 2,
        duration: 6
      }
    });
  }

  run(msg, { year }) {
    try {
      msg.channel.startTyping();

      const options = { uri: `http://numbersapi.com/${year}/year` };

      rp(options)
        .then(result => msg.reply(result))
        .catch(err => {
          logger.error(err);
          return msg.reply('There was an error with the API we use (http://numbersapi.com)');
        });
    } finally {
      msg.channel.stopTyping();
    }
  }
};
