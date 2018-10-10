/*
Copyright 2018 Jonah Snider

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const { Command } = require('discord.js-commando');
const { respond } = require('../../providers/simpleCommandResponse');

module.exports = class AddSelfRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'add-self-role',
      aliases: ['add-self-roles'],
      group: 'selfroles',
      memberName: 'add',
      description: 'Add a role to a server\'s self roles.',
      examples: ['add-self-role @PUBG', 'add-self-role Artists'],
      userPermissions: ['MANAGE_ROLES'],
      guildOnly: true,
      args: [{
        key: 'role',
        prompt: 'Which role do you want to add?',
        type: 'role'
      }],
      throttling: {
        usages: 2,
        duration: 4
      }
    });
  }

  async run(msg, { role }) {
    try {
      msg.channel.startTyping();

      // Get all of this guild's selfroles
      const selfRoles = this.client.provider.get(msg.guild, 'selfRoles', []);

      // Check if the role is already a self role
      if (selfRoles.includes(role.id)) {
        return msg.reply('That role is already a self role.');
      }

      // Check if the author is able to add the role
      if (role.comparePositionTo(msg.member.roles.highest) >= 0 && !msg.member.hasPermission('ADMINISTRATOR')) {
        return msg.reply('You don\'t have the permissions to add that role.');
      }

      // Check if bot is able to add that role
      if (role.comparePositionTo(msg.guild.me.roles.highest) >= 0) {
        return msg.reply('I don\'t have the permissions to add that role.');
      }

      // Check if role is managed by an integration
      if (role.managed) {
        return msg.reply('An integration is managing that role.');
      }

      // Add the new role's ID to the local array
      selfRoles.push(role.id);
      // Set the array to our updated version
      await this.client.provider.set(msg.guild, 'selfRoles', selfRoles);

      // Respond to author with success
      respond(msg);

      return null;
    } finally {
      msg.channel.stopTyping();
    }
  }
};
