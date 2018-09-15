// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const logger = require('../../providers/logger').scope('command', 'unban user');
const { respond } = require('../../providers/simpleCommandResponse');

module.exports = class UnbanUserCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'unban-user',
      aliases: ['unban-member', 'unban', 'unhack-ban', 'unhack-ban-member', 'unhack-ban-user'],
      group: 'mod',
      memberName: 'unban-user',
      description: 'Unban a user from a server.',
      details: 'Works with unbanning users who were hackbanned',
      examples: ['unban Zoop', 'unban 208970190547976202'],
      clientPermissions: ['BAN_MEMBERS'],
      userPermissions: ['BAN_MEMBERS'],
      guildOnly: true,
      args: [{
        key: 'user',
        prompt: 'Which user do you want to unban?',
        type: 'user'
      }, {
        'key': 'reason',
        'prompt': 'What is the reason for unbanning this user?',
        'type': 'string',
        'label': 'reason for ban',
        'default': '',
        'max': 400
      }],
      throttling: {
        usages: 2,
        duration: 4
      }
    });
  }

  async run(msg, { user, reason }) {
    try {
      msg.channel.startTyping();

      reason = reason ? `${reason} - Requested by ${msg.author.tag}` : `Requested by ${msg.author.tag}`;

      const guildBans = await msg.guild.fetchBans();

      // User is regular banned
      logger.debug(`Bans for ${msg.guild}: ${guildBans.array()}`);
      logger.debug(`Is ${user.tag} banned on ${msg.guild}: ${guildBans.has(user.id)}`);
      if (guildBans.has(user.id)) {
        // Unban the user on the guild
        msg.guild.members.unban(user, reason);
        // Respond to author with success
        respond(msg);

        return null;
      }
      return msg.reply(`${user.tag} isn't banned.`);
    } finally {
      msg.channel.stopTyping();
    }
  }
};
