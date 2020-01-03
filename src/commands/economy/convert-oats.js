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
const config = require("../../config");
const discoin = require("../../util/discoin");
const logger = require("../../util/logger").scope("command", "convert oats");
const database = require("../../util/database");
const Discoin = require("@discoin/scambio").default;

module.exports = class ConvertOatsCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "convert-oats",
      group: "economy",
      memberName: "convert-oats",
      description: "Converts oats to another bot's currency.",
      details: "Use the `discoin-rates` command to see all currencies",
      aliases: ["convert", "convert-currencies", "exchange-oats", "exchange", "exchange-currencies", "discoin"],
      examples: ["convert-oats 500 dts"],
      clientPermissions: ["EMBED_LINKS"],
      args: [
        {
          key: "amount",
          prompt: "How many oats do you want to convert to another Discoin currency?",
          type: "integer",
          min: config.minCurrency
        },
        {
          key: "currency",
          prompt: "What currency do you want to convert your oats to?",
          type: "string",
          label: "currency to convert to",
          parse: value => value.toUpperCase()
        }
      ],
      throttling: {
        usages: 1,
        duration: 30
      }
    });
  }

  async exec(msg, { amount, currency }) {
    try {
      msg.channel.startTyping();

      const authorBalance = await database.balances.get(msg.author.id);

      // Amount checking
      if (amount > authorBalance) {
        return msg.reply(
          `You need to have at least \`${amount.toLocaleString()}\` ${
            config.currency.plural
          }. Your balance is \`${authorBalance}\`.`
        );
      }

      try {
        await Discoin.currencies.getOne(currency);
      } catch (error) {
        return msg.reply("An error occurred. Are you sure that currency exists");
      }

      const transaction = await discoin.transactions
        .create({ to: currency, amount, user: msg.author.id })
        .catch(() => msg.reply("An error occurred. Maybe Discoin is offline? Try checking their support server."));

      // Remove oats from author
      await database.balances.decrease(msg.author.id, amount);

      return msg.replyEmbed({
        title: "Conversion Successful",
        url: `https://dash.discoin.zws.im/#/transactions/${transaction.id}/show`,
        color: 0x4caf50,
        timestamp: transaction.timestamp,
        description: `You should be paid in around 5 minutes. If you aren't paid within 10 minutes try contacting the creator of ${transaction.to.name}`,
        fields: [
          {
            name: "Payout",
            value: `${amount} OAT ➡ ${transaction.payout} ${transaction.to.id}`
          },
          {
            name: "Transaction ID",
            value: `[\`${transaction.id}\`](https://dash.discoin.zws.im/#/transactions/${transaction.id}/show)`
          }
        ]
      });
    } catch (error) {
      logger.error(error);

      return msg.reply("An unknown error occured. Try again later.");
    } finally {
      msg.channel.stopTyping();
    }
  }
};
