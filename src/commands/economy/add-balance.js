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
const config = require("../../config");
const database = require("../../util/database");
const simpleFormat = require("../../util/simpleFormat");
const respond = require("../../util/simpleCommandResponse");

module.exports = class AddBalanceCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "add-balance",
      group: "economy",
      memberName: "add-balance",
      description: "Add oats to another user's account.",
      details: "Only the bot owner(s) may use this command.",
      aliases: ["add-bal", "increase-balance", "increase-bal"],
      examples: ["add-balance 500 @Dice"],
      args: [
        {
          key: "amount",
          prompt: "How many oats do you want to add?",
          type: "float",
          min: config.minCurrency,
          parse: amount => simpleFormat(amount)
        },
        {
          key: "user",
          prompt: "Who do you want to add oats to?",
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

  async run(msg, { user, amount }) {
    // Permission checking
    if (user.bot === true && user.id !== this.client.user.id) {
      return msg.reply("You can't add oats to bots.");
    }

    // Add oats to user
    await database.balances.increase(user.id, amount);

    // Respond to author with success
    respond(msg);

    return null;
  }
};
