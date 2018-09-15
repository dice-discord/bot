// Copyright Jonah Snider 2018

const logger = require('../../providers/logger').scope('command', 'unblacklist user');
const { Command } = require('discord.js-commando');
const { respond } = require('../../providers/simpleCommandResponse');

module.exports = class UnblacklistUserCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'unblacklist-user',
      aliases: ['unblacklist', 'remove-blacklist-user', 'remove-blacklist'],
      group: 'util',
      memberName: 'unblacklist-user',
      description: 'Remove a user from the blacklist.',
      throttling: {
        usages: 2,
        duration: 3
      },
      ownerOnly: true,
      args: [{
        key: 'user',
        prompt: 'Who do you want to remove from the blacklist?',
        type: 'user'
      }]
    });
  }

  async run(msg, { user }) {
    // Get all blacklisted users
    const blacklist = this.client.provider.get('global', 'blacklist', []);

    // Check if the user is actually blacklisted
    if (!blacklist.includes(user.id)) return msg.reply('That user isn\'t blacklisted.');

    // Find the user in the array and delete it
    logger.debug(`Blacklist item index: ${blacklist.indexOf(user.id)}`);
    blacklist.splice(blacklist.indexOf(user.id));

    // Set the array to our updated version
    await this.client.provider.set('global', 'blacklist', blacklist);

    // Respond to author with success
    respond(msg);

    return null;
  }
};
