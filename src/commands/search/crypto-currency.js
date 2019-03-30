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
const { currencyCodes } = require("../../config");
const logger = require("../../util/logger").scope("command", "crypto currency look up");
const axios = require("axios");

module.exports = class CryptoCurrencyCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "crypto-currency-look-up",
      group: "search",
      memberName: "crypto-currency",
      description: "Look up a crypto currency.",
      aliases: ["crypto-currency", "crypto-look-up", "crypto"],
      examples: ["crypto-currency-look-up bitcoin", "crypto-currency-look-up ethereum-classic aud"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 30
      },
      args: [
        {
          key: "name",
          prompt: "What is the name of the crypto currency you want to look up?",
          type: "string"
        },
        {
          key: "currency",
          prompt: "What currency do you want to get prices in?",
          type: "string",
          label: "currency code",
          default: "usd",
          parse: value => value.toLowerCase(),
          oneOf: currencyCodes
        }
      ]
    });
  }

  async run(msg, { name, currency }) {
    try {
      msg.channel.startTyping();
      const result = (await axios.get(`https://api.coinmarketcap.com/v1/ticker/${name}/?convert=${currency}`)).data;
      // Result is sent as an array of a singular object
      const [cryptoCurrency] = result;
      logger.debug("Results from CoinMarketCap:", cryptoCurrency);

      return msg.replyEmbed({
        title: `${cryptoCurrency.name} (\`${cryptoCurrency.symbol}\`)`,
        url: `https://coinmarketcap.com/currencies/${cryptoCurrency.id}`,
        // Sets the color to green if the change is positive, red if otherwise
        color: cryptoCurrency.percent_change_24h >= 0 ? 0x4caf50 : 0xf44334,
        timestamp: new Date(cryptoCurrency.last_updated),
        thumbnail: {
          url: `http://cryptoicons.co/128/white/${cryptoCurrency.symbol.toLowerCase()}.png`
        },
        author: {
          name: "CoinMarketCap",
          iconURL: "https://pbs.twimg.com/profile_images/991282814518743040/OEj1fTFp_400x400.jpg",
          url: "https://coinmarketcap.com"
        },
        fields: [
          {
            name: `💰 Price (\`${currency.toUpperCase()}\`)`,
            value: `${cryptoCurrency[`price_${currency}`]} ${currency.toUpperCase()}`
          },
          {
            name: "💰 Price (`BTC`)",
            value: `${cryptoCurrency.price_btc} BTC`
          },
          {
            name: "📊 Ranking",
            value: `#${cryptoCurrency.rank}`
          },
          {
            name: "💹 Percentage Change",
            value: `Past hour: ${cryptoCurrency.percent_change_1h}%\nPast day: ${
              cryptoCurrency.percent_change_24h
            }%\nPast week: ${cryptoCurrency.percent_change_7d}%`
          }
        ]
      });
    } catch (error) {
      const { response } = error;

      if (response.data.error === "id not found") {
        return msg.reply("Unknown crypto currency");
      }
      return msg.reply(`An error occured with CoinMarketCap: \`${response.data.error}\` (code \`${response.status}\`)`);
    } finally {
      msg.channel.stopTyping();
    }
  }
};
