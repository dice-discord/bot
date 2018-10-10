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

const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { currencyCodes } = require('../../config');
const logger = require('../../providers/logger').scope('command', 'top crypto currencies');
const rp = require('request-promise-native');

module.exports = class TopCryptoCurrenciesCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'top-crypto-currencies',
      group: 'search',
      memberName: 'top-crypto-currencies',
      description: 'Get prices for the top crypto currencies.',
      aliases: ['top-crypto-currency', 'top-cryptos', 'top-crypto'],
      examples: ['top-crypto-currencies', 'top-crypto-currencies 5', 'top-crypto-currencies 10 AUD'],
      clientPermissions: ['EMBED_LINKS'],
      throttling: {
        usages: 1,
        duration: 30
      },
      args: [{
        key: 'limit',
        prompt: 'How many items do you want to limit your results for?',
        type: 'integer',
        default: 10,
        min: 2,
        max: 25
      }, {
        key: 'currency',
        prompt: 'What currency do you want to get results in?',
        type: 'string',
        label: 'currency code',
        default: 'usd',
        parse: value => value.toLowerCase(),
        oneOf: currencyCodes
      }]
    });
  }

  async run(msg, { limit, currency }) {
    try {
      msg.channel.startTyping();
      const options = {
        uri: `https://api.coinmarketcap.com/v1/ticker/?convert=${currency}&limit=${limit}`,
        json: true
      };

      const results = await rp(options)
        .catch(error => {
          logger.error(error);
          return msg.reply(`An error occured with CoinMarketCap (\`${error}\`)`);
        });

      logger.debug('Results from CoinMarketCap:', results);

      const embed = new MessageEmbed({
        title: `Top ${limit} Crypto Currencies`,
        author: {
          name: 'CoinMarketCap',
          iconURL: 'https://pbs.twimg.com/profile_images/930670494927421441/GquNeyus_400x400.jpg',
          url: 'https://coinmarketcap.com'
        }
      });

      results.forEach(cryptoCurrency => {
        embed.addField(
          `${cryptoCurrency.name} (\`${cryptoCurrency.symbol}\`)`,
          `${cryptoCurrency[`price_${currency}`]} ${currency.toUpperCase()}`
        );
      });

      return msg.replyEmbed(embed);
    } finally {
      msg.channel.stopTyping();
    }
  }
};
