// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const moment = require('moment');

module.exports = class OldestMemberCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'oldest-member',
      group: 'fun',
      memberName: 'oldest-member',
      description: 'See who the oldest member on the server is.',
      aliases: [
        'oldest-user',
        'oldest'
      ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 6
      }
    });
  }

  run(msg) {
    const oldest = msg.guild.members
      .sort((member1, member2) => {
        const timestamp1 = member1.user.createdTimestamp;
        const timestamp2 = member2.user.createdTimestamp;

        if (timestamp1 > timestamp2) {
          return 1;
        } else if (timestamp1 < timestamp2) {
          return -1;
        }
        return 0;
      })
      .first()
      .user;

    return msg.reply(`${oldest.tag} is the oldest member on this server. Their account was created ${moment.duration(msg.createdAt - oldest.createdAt).humanize()} ago, or ${oldest.createdAt}`);
  }
};
