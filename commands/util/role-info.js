// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class RoleInfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'role-info',
      aliases: ['role'],
      group: 'util',
      memberName: 'role-info',
      description: 'Get information on a role',
      examples: ['quote-message 424936127154094080'],
      guildOnly: true,
      args: [{
        key: 'role',
        prompt: 'What role do you want to get information for?',
        type: 'role'
      }],
      clientPermissions: ['EMBED_LINKS'],
      throttling: {
        usages: 2,
        duration: 6
      }
    });
  }

  run(msg, { role }) {
    const embed = new MessageEmbed({
      title: `${role.name} (${role.id})`,
      timestamp: role.createdAt,
      color: role.color,
      fields: [{
        name: '🔢 Position',
        value: `${role.position + 1} (raw position: ${role.rawPosition})`
      }, {
        name: '**@** Mentionable',
        value: role.mentionable ? 'Yes' : 'No'
      }, {
        name: '💡 Display separately',
        value: role.hoist ? 'Yes' : 'No'
      }, {
        name: '👥 Members',
        value: role.members.size
      }, {
        name: '🔍 Color',
        value: `Use ${msg.anyUsage(`color ${role.hexColor}`)}`
      }]
    });

    return msg.replyEmbed(embed);
  }
};
