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
const simpleFormat = require("../../util/simpleFormat");
const database = require("../../util/database");
const respond = require("../../util/simpleCommandResponse");

module.exports = class CashOutCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "cash-out",
      group: "economy",
      memberName: "cash-out",
      description: "Cash out money from the house.",
      details: "Only the bot owner(s) may use this command.",
      examples: ["cash-out 500"],
      args: [
        {
          key: "amount",
          prompt: "How many oats do you want to remove?",
          type: "float",
          min: config.minCurrency,
          parse: amount => simpleFormat(amount)
        }
      ],
      throttling: {
        usages: 2,
        duration: 30
      },
      ownerOnly: true
    });
  }

  async run(msg, { amount }) {
    const beforeTransferHouseBalance = await database.balances.get(this.client.user.id);

    // Amount checking
    if (amount > beforeTransferHouseBalance) {
      return msg.reply(
        `Your amount must be less than \`${beforeTransferHouseBalance.toLocaleString()}\` ${config.currency.plural}. ${
          this.client.user
        } doesn't have that much.`
      );
    }

    // Round to whole number
    amount = Math.round(amount);

    // Remove oats from the house
    database.balances.decrease(this.client.user.id, amount);

    // Add oats to author
    database.balances.increase(msg.author.id, amount);

    // Respond to author with success
    respond(msg);

    return null;
  }
};
