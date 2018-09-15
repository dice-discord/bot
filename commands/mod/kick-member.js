// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const { respond } = require('../../providers/simpleCommandResponse');

module.exports = class KickMemberCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'kick-member',
      aliases: ['kick-user', 'kick'],
      group: 'mod',
      memberName: 'kick-member',
      description: 'Kick a member from your server.',
      examples: ['kick @Zoop', 'kick 213041121700478976', 'kick Zoop Spamming messages'],
      clientPermissions: ['KICK_MEMBERS'],
      userPermissions: ['KICK_MEMBERS'],
      guildOnly: true,
      throttling: {
        usages: 3,
        duration: 6
      },
      args: [{
        key: 'member',
        prompt: 'Which member do you want to kick?',
        type: 'member'
      }, {
        'key': 'reason',
        'prompt': 'What is the reason for kicking this member?',
        'type': 'string',
        'label': 'reason for kick',
        'default': '',
        'max': 400
      }]
    });
  }

  run(msg, { member, reason }) {
    try {
      msg.channel.startTyping();

      if (reason) {
        reason = `${reason} - Requested by ${msg.author.tag}`;
      } else {
        reason = `Requested by ${msg.author.tag}`;
      }

      if (member.kickable) {
        // Member not on guild or kickable
        member.kick(reason)
          .then(() => respond(msg))
          .catch(() => msg.reply('Unable to kick that user'));

        return null;
      }
      // Member not kickable
      return msg.reply('I can\'t kick that member');
    } finally {
      msg.channel.stopTyping();
    }
  }
};
