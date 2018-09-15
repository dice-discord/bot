// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class ListRolesCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'list-roles',
      aliases: ['all-roles', 'roles'],
      group: 'util',
      memberName: 'list-roles',
      description: 'List all roles on a server.',
      guildOnly: true,
      clientPermissions: ['EMBED_LINKS'],
      throttling: {
        usages: 2,
        duration: 6
      }
    });
  }

  run(msg) {
    const embed = new MessageEmbed({
      title: 'All roles',
      timestamp: new Date(),
      description: msg.guild.roles
        .sort((role1, role2) => role2.position - role1.position)
        .array()
        .join(', ')
    });

    return msg.replyEmbed(embed);
  }
};
