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

const SentryCommand = require("../../structures/SentryCommand");
const respond = require("../../util/simpleCommandResponse");

module.exports = class DeleteSelfRoleCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "delete-self-role",
      aliases: [
        "self-role-delete",
        "self-roles-delete",
        "delete-self-roles",
        "del-self-roles",
        "self-role-del",
        "self-roles-del",
        "del-self-role"
      ],
      group: "selfroles",
      memberName: "delete",
      description: "Delete a self-assigned role from this server.",
      examples: ["delete-self-role @PUBG", "delete-self-role Artists"],
      userPermissions: ["MANAGE_ROLES"],
      guildOnly: true,
      args: [
        {
          key: "role",
          prompt: "Which selfrole do you want to delete?",
          type: "role"
        }
      ],
      throttling: {
        usages: 2,
        duration: 4
      }
    });
  }

  async run(msg, { role }) {
    // Get all of this guild's selfroles
    const selfRoles = await this.client.provider.get(msg.guild, "selfRoles", []);

    // Check if the role isn't a self role
    if (!selfRoles.includes(role.id)) {
      return msg.reply("That role isn't a self role.");
    }

    // Check if the author is able to delete the role
    if (role.comparePositionTo(msg.member.roles.highest) >= 0 || !msg.member.hasPermission("ADMINISTRATOR")) {
      return msg.reply("You don't have the permissions to delete that role.");
    }

    // Find the position of the role and delete it from the array
    selfRoles.splice(selfRoles.indexOf(role.id));
    // Set the array to our updated version
    await this.client.provider.set(msg.guild, "selfRoles", selfRoles);

    // Respond to author with success
    respond(msg);

    return null;
  }
};
