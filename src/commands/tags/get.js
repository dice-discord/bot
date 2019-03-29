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

module.exports = class GetTagCommand extends Command {
  constructor(client) {
    super(client, {
      name: "get-tag",
      aliases: ["tag-get", "tag", "read-tag"],
      group: "tags",
      memberName: "get",
      description: "Get a tag from a server's tags.",
      examples: ["get-tag help"],
      guildOnly: true,
      args: [
        {
          key: "name",
          prompt: "Which tag do you want to get?",
          type: "string",
          parse: val => Util.cleanContent(val.toLowerCase()),
          max: 50
        }
      ],
      throttling: {
        usages: 2,
        duration: 4
      }
    });
  }

  async run(msg, { name }) {
    // Get the tags
    const tags = await this.client.provider.get(msg.guild, "tags", {});
    const tag = tags[name];
    return msg.reply(
      tags.hasOwnProperty(name)
        ? tag.value
        : "That tag doesn't exist"
    );
  }
};
