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
const database = require("../../util/database");
const simpleFormat = require("../../util/simpleFormat");
const config = require("../../config");
const respond = require("../../util/simpleCommandResponse");

module.exports = class SetBalanceCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "set-balance",
      group: "economy",
      memberName: "set-balance",
      description: "Set a user's balance.",
      details: "Only the bot owner(s) may use this command.",
      aliases: ["set-bal", "set-balance"],
      examples: ["set-balance 500 @Dice"],
      args: [
        {
          key: "amount",
          prompt: "What do you want the new balance to be?",
          type: "float",
          parse: amount => simpleFormat(amount),
          min: config.minCurrency
        },
        {
          key: "user",
          prompt: "Who's balance do you want to set?",
          type: "user"
        }
      ],
      throttling: {
        usages: 2,
        duration: 30
      },
      ownerOnly: true
    });
  }

  async exec(msg, { user, amount }) {
    try {
      msg.channel.startTyping();
      // Permission checking
      if (user.bot === true && user.id !== this.client.user.id) {
        return msg.reply("You can't add oats to bots.");
      }

      // Add oats to user
      await database.balances.set(user.id, amount);

      // Respond to author with success
      respond(msg);

      return null;
    } finally {
      msg.channel.stopTyping();
    }
  }
};
