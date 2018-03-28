// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const config = require('../../config');
const rp = require('request-promise');
const winston = require('winston');
const diceAPI = require('../../providers/diceAPI');

module.exports = class ConvertOatsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'convert-oats',
			group: 'economy',
			memberName: 'convert-oats',
			description: 'Converts oats to another bot\'s currency',
			details: 'Use the `discoin-rates` command to see all currencies',
			aliases: ['convert', 'convert-currencies'],
			examples: ['convert-oats 500 dts'],
			args: [{
				key: 'amount',
				prompt: 'How many oats do you want to convert to another Discoin currency?',
				type: 'integer',
				min: config.minWager
			}, {
				key: 'currency',
				prompt: 'What currency do you want to convert your oats to?',
				type: 'string',
				label: 'currency to convert to',
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

			const authorBalance = await diceAPI.getBalance(msg.author.id);

			// Amount checking
			if(amount > authorBalance) {
				// eslint-disable-next-line max-len
				return msg.reply(`❌ You need to have at least \`${amount}\` ${config.currency.plural}. Your balance is \`${authorBalance}\`.`);
			}

			rp({
				json: true,
				method: 'POST',
				url: 'http://discoin.sidetrip.xyz/transaction',
				headers: { Authorization: config.discoinToken },
				resolveWithFullResponse: true,
				body: {
					user: msg.author.id,
					amount: amount,
					exchangeTo: currency
				}
			})
				.then(async response => {
					// Remove oats from author
					await diceAPI.decreaseBalance(msg.author.id, amount);

					winston.debug('[COMMAND](CONVERT-OATS) Response body from Discoin', response.body);

					msg.replyEmbed({
						title: '💱 Conversion Successful',
						color: 0x4caf50,
						footer: { text: `${response.body.limitNow} uses for ${currency} remaining today` },
						timestamp: new Date(response.body.timestamp * 1000),
						fields: [{
							name: '💰 Amount',
							value: `${amount} OAT ➡ ${response.body.resultAmount} ${currency}`
						}, {
							name: '🗒 Receipt',
							value: `\`${response.body.receipt}\``
						}]
					});
				})
				.catch(response => {
					switch(response.statusCode) {
						case 503:
							return msg.reply('Discoin is currently unavailable. Try again later');
						case 403:
							switch(response.body.reason) {
								case 'verify required':
									return msg.replyEmbed({
										title: '🆔 Verification Required',
										color: 0xff9800,
										url: 'http://discoin.sidetrip.xyz/verify'
									});
								case 'per-user limit exceeded':
									return msg.replyEmbed({
										title: '🕒 Daily Limit Reached',
										color: 0xf44336,
										description: 'You have reached your daily limit for the convert command. Try again tomorrow.'
									});
								case 'total limit exceeded':
									return msg.replyEmbed({
										title: '🕒 Bot Daily Limit Reached',
										color: 0xf44336,
										description: `${this.client.user} has reached the daily total limit. Try again tomorrow.`
									});
							}
							break;
						default:
							return msg.reply('An unknown error occured. Try again later.');
					}
					return null;
				});

			return null;
		} finally {
			msg.channel.stopTyping();
		}
	}
};
