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
const rp = require("request-promise-native");
const database = require("../../util/database");

module.exports = class RefundTransactionCommand extends Command {
  constructor(client) {
    super(client, {
      name: "refund-transaction",
      group: "economy",
      memberName: "refund-transaction",
      description: "Refund a transaction on Discoin.",
      aliases: ["refund", "revert-transaction", "revert"],
      examples: ["refund-transaction e03f7f5b048414d8eadf9fd6e1245803b3c2da9a"],
      clientPermissions: ["EMBED_LINKS"],
      args: [
        {
          key: "receipt",
          prompt: "What is the receipt for the transaction you want to revert?",
          type: "string",
          label: "transaction receipt",
          min: 40,
          max: 40
        }
      ],
      throttling: {
        usages: 1,
        duration: 30
      },
      ownerOnly: true
    });
  }

  run(msg, { receipt }) {
    try {
      msg.channel.startTyping();

      rp({
        json: true,
        method: "POST",
        url: "http://discoin.sidetrip.xyz/transaction/reverse",
        headers: { authorization: config.discoinToken },
        resolveWithFullResponse: true,
        body: { receipt }
      })
        .then(response => {
          rp({
            json: true,
            method: "GET",
            url: `http://discoin.sidetrip.xyz/transaction/${receipt}`,
            headers: { authorization: config.discoinToken },
            resolveWithFullResponse: true,
            body: { receipt }
          })
            .then(async transactionResponse => {
              await database.balances.increase(transactionResponse.body.user, response.body.refundAmount);

              msg.replyEmbed({
                title: "Refund Successful",
                color: 0x4caf50,
                timestamp: new Date(transactionResponse.body.processTime),
                fields: [
                  {
                    name: "💰 Refunded Amount",
                    value: `${response.body.refundAmount} oats refunded`
                  }
                ]
              });
            })
            .catch(transactionResponse => {
              switch (transactionResponse.statusCode) {
                case 503:
                  return msg.reply("Discoin is currently unavailable. Try again later.");
                case 404:
                  return msg.reply("Transaction not found.");
                default:
                  return msg.reply("An unknown error occured. Try again later.");
              }
            });
        })
        .catch(response => {
          switch (response.statusCode) {
            case 503:
              return msg.reply("Discoin is currently unavailable. Try again later.");
            case 400:
              switch (response.body.reason) {
                case "cannot refund a refund":
                  return msg.reply("You can\t refund a refund.");
                case "transaction already reversed":
                  return msg.reply("Transaction has already been reversed.");
              }
              break;
            case 403:
              return msg.reply("Transaction must be to this bot");
            case 404:
              return msg.reply("Transaction not found");
            default:
              return msg.reply("An unknown error occured. Try again later.");
          }
          return null;
        });

      return null;
    } finally {
      msg.channel.stopTyping();
    }
  }
};
