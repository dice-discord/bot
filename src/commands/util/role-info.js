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
const { MessageEmbed } = require("discord.js");

module.exports = class RoleInfoCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "role-info",
      aliases: ["role"],
      group: "util",
      memberName: "role-info",
      description: "Get information on a role",
      examples: ["quote-message 424936127154094080"],
      guildOnly: true,
      args: [
        {
          key: "role",
          prompt: "What role do you want to get information for?",
          type: "role"
        }
      ],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 2,
        duration: 6
      }
    });
  }

  exec(msg, { role }) {
    const embed = new MessageEmbed({
      title: `${role.name} (${role.id})`,
      timestamp: role.createdAt,
      color: role.color,
      fields: [
        {
          name: "🔢 Position",
          value: `${role.position + 1} (raw position: ${role.rawPosition})`
        },
        {
          name: "**@** Mentionable",
          value: role.mentionable ? "Yes" : "No"
        },
        {
          name: "💡 Display separately",
          value: role.hoist ? "Yes" : "No"
        },
        {
          name: "👥 Members",
          value: role.members.size
        },
        {
          name: "🔍 Color",
          value: `Use ${msg.anyUsage(`color ${role.hexColor}`)}`
        }
      ]
    });

    return msg.replyEmbed(embed);
  }
};
