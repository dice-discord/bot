// Copyright 2018 Jonah Snider

const moment = require('moment');
const { Command } = require('discord.js-commando');

module.exports = class ErrorCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'error',
      group: 'dev',
      memberName: 'error',
      description: 'Throws an error.',
      aliases: ['err'],
      ownerOnly: true
    });
  }

  run(msg) {
    return msg.reply(`⏰ ${moment().duration(msg.createdAt - msg.author.createdAt).humanize()}.`);
  }
};
