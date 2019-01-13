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
const { Util } = require("discord.js");

module.exports = class ListSelfRolesCommand extends Command {
  constructor(client) {
    super(client, {
      name: "list-self-roles",
      aliases: [
        "self-role-list",
        "self-roles-list",
        "list-self-role",
        "self-roles"
      ],
      group: "selfroles",
      memberName: "list",
      description: "List all self-assigned roles from this server.",
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 4
      }
    });
  }

  async run(msg) {
    // Get all of this guild's selfroles
    const selfRoles = await this.client.provider.get(
      msg.guild,
      "selfRoles",
      []
    );

    // If the selfroles array is empty
    if (selfRoles.length === 0) {
      return msg.reply("No selfroles");
    }

    // List of role names
    const roleList = [];

    // Iterate through each role on the guild
    for (const [id, guild] of msg.guild.roles.entries()) {
      if (!msg.guild.roles.has(id)) {
        // Find the position of the non-existent role and delete it from the array
        selfRoles.splice(selfRoles.indexOf(id));
        // Set the array to our updated version
        this.client.provider.set(msg.guild, "selfRoles", selfRoles);
      } else if (selfRoles.includes(id) && msg.member.roles.has(id)) {
        // The role is a selfrole and the author has it
        roleList.push(`${guild.name} ▫`);
      } else if (selfRoles.includes(id)) {
        // The role is a selfrole
        roleList.push(guild.name);
      }
    }

    return msg.reply(
      `A ▫ indicates a role you currently have\n${Util.escapeMarkdown(
        Util.cleanContent(roleList.join("\n"), msg)
      )}`
    );
  }
};
