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
const { Util } = require("discord.js");
const respond = require("../../util/simpleCommandResponse");

module.exports = class CreateTagCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "create-tag",
      aliases: ["add-tag", "tag-create", "tag-add", "make-tag", "tag-make"],
      group: "tags",
      memberName: "create",
      description: "Add a tag to a server's tags.",
      examples: ["create-tag help If you need help, look for someone with a purple name"],
      guildOnly: true,
      args: [
        {
          key: "name",
          prompt: "What do you want the name of the new tag to be?",
          type: "string",
          parse: val => Util.cleanContent(val.toLowerCase()),
          max: 50
        },
        {
          key: "value",
          prompt: "What do you want the value of the new tag to be?",
          type: "string",
          parse: val => Util.cleanContent(val),
          max: 1800
        }
      ],
      throttling: {
        usages: 2,
        duration: 4
      }
    });
  }

  async exec(msg, { name, value }) {
    // Get the tags
    const tags = await this.client.provider.get(msg.guild, "tags", {});
    if (tags.hasOwnProperty(name)) return msg.reply("That tag already exists.");

    // Set the tag with the name to the value
    tags[name] = { value, author: msg.author.id };

    // Set the object to our updated version
    await this.client.provider.set(msg.guild, "tags", tags);

    // Respond to author with success
    respond(msg);

    return null;
  }
};
