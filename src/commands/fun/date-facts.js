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
const logger = require("../../util/logger").scope("command", "date facts");

module.exports = class DateFactsCommand extends Command {
  constructor(client) {
    super(client, {
      name: "date-facts",
      group: "fun",
      memberName: "date-facts",
      description: "Get a fact about a date.",
      details: "Not specifying the date to lookup will give you a random fact",
      aliases: ["date-fact", "random-date-facts", "random-date-fact"],
      examples: ["date-facts", "date-facts 46"],
      args: [
        {
          key: "month",
          prompt: "What month do you want to get facts for?",
          type: "integer",
          max: 12,
          min: 1,
          default: "random"
        },
        {
          key: "day",
          prompt: "What day of the month do you want to get facts for?",
          type: "integer",
          max: 31,
          min: 1,
          default: "random"
        }
      ],
      throttling: {
        usages: 2,
        duration: 6
      }
    });
  }

  async run(msg, { month, day }) {
    try {
      msg.channel.startTyping();

      const uri = `http://numbersapi.com/${month === "random" || day === "random" ? "random" : `${month}/${day}`}/date`;
      return msg.reply((await axios.get(uri)).data);
    } catch (error) {
      logger.error(error);
      return msg.reply("There was an error with the API we use (http://numbersapi.com)");
    } finally {
      msg.channel.stopTyping();
    }
  }
};
