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
const logger = require("../../util/logger").scope("command", "bible");
const truncateText = require("../../util/truncateText");

module.exports = class BibleCommand extends Command {
  constructor(client) {
    super(client, {
      name: "bible",
      group: "search",
      memberName: "bible",
      description: "Get any bible verse from the World English Bible",
      examples: ["bible john 3 16", "bible jn 3 16"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 4
      },
      args: [
        {
          key: "book",
          prompt: "What book name do you want to get a verse from?",
          type: "string",
          label: "book name"
        },
        {
          key: "chapter",
          prompt: "Which chapter do you want to get a verse from?",
          type: "integer",
          min: 1
        },
        {
          key: "verse",
          prompt: "Which verse do you want to get from the chapter?",
          type: "integer",
          min: 1
        }
      ]
    });
  }

  run(msg, { book, chapter, verse }) {
    try {
      msg.channel.startTyping();

      axios
        .get(`https://bible-api.com/${book} ${chapter}:${verse}`)
        .then(response => {
          const { data } = response;

          return msg.replyEmbed({
            title: data.reference,
            author: {
              name: "World English Bible",
              url: "https://bible-api.com/"
            },
            description: truncateText(data.text)
          });
        })
        .catch(err => {
          logger.error(err);
          if (err.status === 404) {
            return msg.reply("That bible verse couldn't be found.");
          }
          return msg.reply("There was an error with the service to get bible verses we use (https://bible-api.com)");
        });
    } finally {
      msg.channel.stopTyping();
    }
  }
};
