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
const stocks = require("yahoo-stocks");

module.exports = class StockCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "look-up-stock",
      group: "search",
      memberName: "stock",
      description: "Get the price of a stock.",
      aliases: ["stock", "stock-look-up", "stocks"],
      examples: ["look-up-stock AAPL"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 4,
        duration: 20
      },
      args: [
        {
          key: "symbol",
          prompt: "What is the ticker symbol of the stock you want to look up?",
          label: "ticker symbol",
          type: "string",
          max: 5,
          parse: value => value.toUpperCase()
        }
      ]
    });
  }

  run(msg, { symbol }) {
    try {
      msg.channel.startTyping();

      stocks
        .lookup(symbol)
        .then(stock =>
          msg.replyEmbed({
            title: `${stock.name} (\`${stock.exchange}: ${stock.symbol}\`)`,
            url: `http://www.nasdaq.com/symbol/${stock.symbol}/real-time`,
            author: {
              name: "Yahoo! Finance",
              iconURL: "https://i.imgur.com/LinLXni.png",
              url: "https://finance.yahoo.com"
            },
            fields: [
              {
                name: "Price (`USD`)",
                value: `$${stock.currentPrice}`,
                inline: true
              },
              {
                name: "High Price (`USD`)",
                value: `$${stock.highPrice}`,
                inline: true
              },
              {
                name: "Low Price (`USD`)",
                value: `$${stock.lowPrice}`,
                inline: true
              },
              {
                name: "Mean Price (`USD`)",
                value: `$${stock.meanPrice}`,
                inline: true
              },
              {
                name: "Median Price (`USD`)",
                value: `$${stock.medianPrice}`,
                inline: true
              }
            ]
          })
        )
        .catch(error => {
          // When stock isn't found it returns true
          if (error === true) {
            return msg.reply("Unknown stock");
          }
          return msg.reply(`An unknown error occured with Yahoo Finance (\`${error}\`)`);
        });
    } finally {
      msg.channel.stopTyping();
    }
  }
};
