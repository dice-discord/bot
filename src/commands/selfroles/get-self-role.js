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

const { Command } = require("discord.js-commando");
const respond = require("../../util/simpleCommandResponse");

module.exports = class GetSelfRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: "get-self-role",
      aliases: ["self-role-get", "self-roles-get", "get-self-roles"],
      group: "selfroles",
      memberName: "get",
      description: "Get a self-assigned role from this server.",
      examples: ["get-self-role @PUBG", "get-self-role Artists"],
      clientPermissions: ["MANAGE_ROLES"],
      guildOnly: true,
      args: [
        {
          key: "role",
          prompt: "Which role do you want to get?",
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
    const selfRoles = await this.client.provider.get(
      msg.guild,
      "selfRoles",
      []
    );

    // Check if the role isn't a self role
    if (!selfRoles.includes(role.id)) {
      return msg.reply("That role isn't a self role.");
    }

    // Check if the role exists on the guild
    if (!msg.guild.roles.has(role.id)) {
      // Find the position of the non-existent role and delete it from the array
      selfRoles.splice(selfRoles.indexOf(role.id));
      // Set the array to our updated version
      this.client.provider.set(msg.guild, "selfRoles", selfRoles);

      return msg.reply("That role doesn'nt exist anymore.");
    }

    // Check if author already has the role
    if (msg.member.roles.has(role.id)) {
      return msg.reply("You already have that role.");
    }

    msg.member.roles
      .add(role.id, "Selfrole")
      .then(() => respond(msg))
      .catch(() => msg.reply("Unable to give you that role."));

    return null;
  }
};
