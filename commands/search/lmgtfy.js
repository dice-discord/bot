// Copyright Jonah Snider 2018

const { Command } = require('discord.js-commando');

module.exports = class LMGTFYCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'lmgtfy',
      group: 'search',
      memberName: 'lmgtfy',
      description: 'Generate a let-me-Google-that-for-you link.',
      examples: ['lmgtfy dice discord bot'],
      aliases: ['let-me-google-that-for-you'],
      throttling: {
        usages: 2,
        duration: 6
      },
      args: [{
        key: 'query',
        prompt: 'What do you want the link to search for?',
        type: 'string',
        max: 500,
        parse: value => encodeURIComponent(value)
      }]
    });
  }

  run(msg, { query }) {
    return msg.reply(`https://lmgtfy.com/?iie=1&q=${query}`);
  }
};
