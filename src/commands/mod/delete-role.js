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
const respond = require('../../util/simpleCommandResponse');

module.exports = class DeleteSelfRolesCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'delete-role',
      aliases: [
        'role-delete',
        'roles-delete',
        'delete-roles',
        'del-roles',
        'role-del',
        'roles-del',
        'del-role'
      ],
      group: 'mod',
      memberName: 'delete-role',
      description: 'Delete a role from this server.',
      examples: ['delete-role @PUBG', 'delete-role Artists'],
      userPermissions: ['MANAGE_ROLES'],
      guildOnly: true,
      args: [{
        key: 'role',
        prompt: 'What role do you want to delete?',
        type: 'role'
      }],
      throttling: {
        usages: 2,
        duration: 4
      }
    });
  }

  run(msg, { role }) {
    // Check if the author is able to delete the role
    if (role.comparePositionTo(msg.member.roles.highest) >= 0 || !msg.member.hasPermission('ADMINISTRATOR')) {
      return msg.reply('You don\'t have the permissions to delete that role.');
    }

    role.delete(`Requested by ${msg.author.tag}`)
    // Respond to author with success
      .then(() => {
        respond(msg);
        return null;
      })
      .catch(() => msg.reply('Unable to delete that role.'));

    return null;
  }
};
