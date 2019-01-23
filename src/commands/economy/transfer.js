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
const config = require("../../config");
const database = require("../../util/database");
const simpleFormat = require("../../util/simpleFormat");
const respond = require("../../util/simpleCommandResponse");

module.exports = class TransferCommand extends Command {
  constructor(client) {
    super(client, {
      name: "transfer",
      group: "economy",
      memberName: "transfer",
      description: "Transfer oats to another user.",
      aliases: ["send", "pay"],
      examples: ["transfer 500 @Dice"],
      args: [
        {
          key: "amount",
          prompt: "How many oats do you want to transfer?",
          type: "float",
          parse: amount => simpleFormat(amount),
          min: config.minCurrency
        },
        {
          key: "user",
          prompt: "Who do you want to transfer oats to?",
          type: "user"
        }
      ],
      throttling: {
        usages: 1,
        duration: 30
      }
    });
  }

  async run(msg, { user, amount }) {
    try {
      msg.channel.startTyping();

      // Amount checking
      if (amount > (await database.balances.get(msg.author.id))) {
        // eslint-disable-next-line max-len
        return msg.reply(
          `You need to have at least \`${amount.toLocaleString()}\` ${
            config.currency.plural
          }. Your balance is \`${await database.balances.get(msg.author.id)}\`.`
        );
      }

      // No sending money to yourself
      if (msg.author.id === user.id) {
        return msg.reply("You can't send money to yourself.");
      }

      // No sending money to bots
      if (user.bot === true && user.id !== this.client.user.id) {
        return msg.reply(`You can't send ${config.currency.plural} to bots.`);
      }

      // Remove oats from sender
      await database.balances.decrease(msg.author.id, amount);

      // Add oats to receiver
      await database.balances.increase(user.id, amount);

      // Respond to author with success
      respond(msg);

      return null;
    } finally {
      msg.channel.stopTyping();
    }
  }
};
