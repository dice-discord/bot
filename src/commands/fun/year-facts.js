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
const rp = require("request-promise-native");
const logger = require("../../util/logger").scope("command", "year facts");

module.exports = class YearFactsCommand extends Command {
  constructor(client) {
    super(client, {
      name: "year-facts",
      group: "fun",
      memberName: "year-facts",
      description: "Get a fact about a year.",
      details: "Not specifying the year to lookup will give you a random fact",
      aliases: ["year-fact", "random-year-facts", "random-year-fact"],
      examples: ["year-facts", "year-facts 1969"],
      args: [
        {
          key: "year",
          prompt: "What year do you want to get facts for?",
          type: "integer",
          default: "random"
        }
      ],
      throttling: {
        usages: 2,
        duration: 6
      }
    });
  }

  run(msg, { year }) {
    try {
      msg.channel.startTyping();

      const options = { uri: `http://numbersapi.com/${year}/year` };

      rp(options)
        .then(result => msg.reply(result))
        .catch(err => {
          logger.error(err);
          return msg.reply(
            "There was an error with the API we use (http://numbersapi.com)"
          );
        });
    } finally {
      msg.channel.stopTyping();
    }
  }
};
