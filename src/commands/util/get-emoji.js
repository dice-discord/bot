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

module.exports = class RoleInfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: "get-emoji",
      aliases: ["emoji", "get-custom-emoji", "custom-emoji"],
      group: "util",
      memberName: "get-emoji",
      description: "Get information on a custom emoji",
      examples: ["emoji thonk"],
      guildOnly: true,
      args: [
        {
          key: "emoji",
          prompt: "What emoji do you want to view?",
          type: "custom-emoji"
        }
      ],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 2,
        duration: 6
      }
    });
  }

  run(msg, { emoji }) {
    const embed = new MessageEmbed({
      title: `${emoji.name} (${emoji.id})`,
      timestamp: emoji.createdAt,
      image: emoji.url,
      fields: [
        {
          name: "Animated",
          value: emoji.animated ? "Yes" : "No"
        },
        {
          name: "Identifier",
          value: `\`${emoji.identifier}\``
        }
      ]
    });

    return msg.replyEmbed(embed);
  }
};
