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
const axios = require("axios");
const logger = require("../../util/logger").scope("command", "random cat image");

module.exports = class RandomCatImageCommand extends Command {
  constructor(client) {
    super(client, {
      name: "random-cat-image",
      group: "fun",
      memberName: "random-cat-image",
      description: "Get a picture of a random cat.",
      aliases: ["random-cat", "cat-image", "cat"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 4
      }
    });
  }

  async run(msg) {
    try {
      msg.channel.startTyping();

      return msg.replyEmbed({
        author: {
          name: "random.cat",
          iconURL: "https://i.imgur.com/Ik0Gf0r.png",
          url: "http://random.cat"
        },
        image: { url: (await axios.get("http://aws.random.cat/meow")).data.file }
      });
    } catch (error) {
      logger.error(error);
      return msg.reply("There was an error with the API we use (http://random.cat)");
    } finally {
      msg.channel.stopTyping();
    }
  }
};
