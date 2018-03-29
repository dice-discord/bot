// Copyright Jonah Snider 2018

const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { currencyCodes } = require('../../config');
const winston = require('winston');
const rp = require('request-promise-native');

module.exports = class TopCryptoCurrenciesCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'top-crypto-currencies',
			group: 'util',
			memberName: 'top-crypto-currencies',
			description: 'Get the top prices for crypto currencies',
			aliases: ['top-crypto-currency', 'top-cryptos', 'top-crypto'],
			examples: ['top-crypto-currencies', 'top-crypto-currencies 5', 'top-crypto-currencies 10 AUD'],
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
				.catch(error => msg.reply(`❌ An error occured with CoinMarketCap (\`${error}\`)`));

			winston.debug('[COMMAND](TOP-CRYPTO-CURRENCIES) Results from CoinMarketCap:', results);

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
