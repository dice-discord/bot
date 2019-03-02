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
const axios = require("axios");
const logger = require("../../util/logger").scope("command", "convert oats");
const database = require("../../util/database");

module.exports = class ConvertOatsCommand extends Command {
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
          oneOf: config.discoinCurrencyCodes,
          parse: value => value.toUpperCase()
        }
      ],
      throttling: {
        usages: 1,
        duration: 30
      }
    });
  }

  async run(msg, { amount, currency }) {
    try {
      msg.channel.startTyping();

      const authorBalance = await database.balances.get(msg.author.id);

      // Amount checking
      if (amount > authorBalance) {
        // eslint-disable-next-line max-len
        return msg.reply(
          `You need to have at least \`${amount.toLocaleString()}\` ${
            config.currency.plural
          }. Your balance is \`${authorBalance}\`.`
        );
      }

      const response = await axios({
        method: "POST",
        headers: { Authorization: config.discoinToken },
        data: {
          user: msg.author.id,
          amount,
          exchangeTo: currency
        },
        url: "http://discoin.sidetrip.xyz/transaction"
      });
      // Remove oats from author
      await database.balances.decrease(msg.author.id, amount);

      logger.debug("Response data from Discoin", response.data);

      return msg.replyEmbed({
        title: "Conversion Successful",
        color: 0x4caf50,
        footer: {
          text: `${response.data.limitNow} Discoin remaining today`
        },
        timestamp: new Date(response.data.timestamp * 1000),
        fields: [
          {
            name: "Amount",
            value: `${amount} OAT ➡ ${response.data.resultAmount} ${currency}`
          },
          {
            name: "Receipt",
            value: `\`${response.data.receipt}\``
          }
        ]
      });
    } catch (error) {
      logger.error(error);

      switch (error.status) {
        case 503:
          return msg.reply("Discoin is currently unavailable. Try again later");
        case 403:
          if (!error.data || !error.data.reason) {
            return msg.reply("A 403 error was sent by Discoin. They didn't say why.");
          }
          switch (error.data.reason) {
            case "verify required":
              return msg.replyEmbed({
                title: "Verification Required",
                color: 0xff9800,
                url: "http://discoin.sidetrip.xyz/verify"
              });
            case "per-user limit exceeded":
              return msg.replyEmbed({
                title: "Daily Limit Reached",
                color: 0xf44336,
                description: "You have reached your daily limit for the convert command. Try again tomorrow."
              });
            case "total limit exceeded":
              return msg.replyEmbed({
                title: "Bot Daily Limit Reached",
                color: 0xf44336,
                description: `${this.client.user} has reached the daily total limit. Try again tomorrow.`
              });
            default:
              return msg.reply("A 403 error was sent by Discoin. They didn't say why.");
          }
        default:
          return msg.reply("An unknown error occured. Try again later.");
      }
    } finally {
      msg.channel.stopTyping();
    }
  }
};
