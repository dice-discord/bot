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
const { MessageEmbed } = require("discord.js");

module.exports = class ListRolesCommand extends Command {
  constructor(client) {
    super(client, {
      name: "list-roles",
      aliases: ["all-roles", "roles"],
      group: "util",
      memberName: "list-roles",
      description: "List all roles on a server.",
      guildOnly: true,
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 2,
        duration: 6
      }
    });
  }

  run(msg) {
    const embed = new MessageEmbed({
      title: "All Roles",
      description: msg.guild.roles
        .sort((role1, role2) => role2.position - role1.position)
        .array()
        .join(", ")
    });

    return msg.replyEmbed(embed);
  }
};
