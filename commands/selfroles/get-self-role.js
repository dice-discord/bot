// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const { respond } = require('../../providers/simpleCommandResponse');

module.exports = class GetSelfRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'get-self-role',
      aliases: ['self-role-get', 'self-roles-get', 'get-self-roles'],
      group: 'selfroles',
      memberName: 'get',
      description: 'Get a self-assigned role from this server.',
      examples: ['get-self-role @PUBG', 'get-self-role Artists'],
      clientPermissions: ['MANAGE_ROLES'],
      guildOnly: true,
      args: [{
        key: 'role',
        prompt: 'Which role do you want to get?',
        type: 'role'
      }],
      throttling: {
        usages: 2,
        duration: 4
      }
    });
  }

  run(msg, { role }) {
    // Get all of this guild's selfroles
    const selfRoles = this.client.provider.get(msg.guild, 'selfRoles', []);

    // Check if the role isn't a self role
    if (!selfRoles.includes(role.id)) {
      return msg.reply('That role isn\'t a self role.');
    }

    // Check if the role exists on the guild
    if (!msg.guild.roles.has(role.id)) {
      // Find the position of the non-existent role and delete it from the array
      selfRoles.splice(selfRoles.indexOf(role.id));
      // Set the array to our updated version
      this.client.provider.set(msg.guild, 'selfRoles', selfRoles);

      return msg.reply('That role doesn\'nt exist anymore.');
    }

    // Check if author already has the role
    if (msg.member.roles.has(role.id)) {
      return msg.reply('You already have that role.');
    }

    msg.member.roles.add(role.id, 'Selfrole')
      .then(() => respond(msg))
      .catch(() => msg.reply('Unable to give you that role.'));

    return null;
  }
};
