/*
Copyright 2019 Jonah Snider

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
const { stripIndents } = require("common-tags");

module.exports = class NitroCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "nitro",
      aliases: ["discord-nitro", "nitro-message", "nitro-msg"],
      group: "single",
      memberName: "nitro",
      description: "This message can only be viewed by users with Discord Nitro.",
      clientPermissions: ["EMBED_LINKS"]
    });
  }

  exec(msg) {
    const embed = {
      author: {
        name: "Discord Nitro",
        iconURL: "https://cdn.discordapp.com/emojis/314068430611415041.png",
        url: "https://discordapp.com/nitro"
      },
      thumbnail: {
        url: "https://cdn.discordapp.com/emojis/314068430611415041.png"
      },
      color: 0x8395d3,
      timestamp: new Date(),
      description: stripIndents`
			This message can only be viewed by users with Discord Nitro.
			[Lift off with Discord Nitro today](https://discordapp.com/nitro).`
    };
    return msg.embed(embed);
  }
};
