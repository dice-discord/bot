// Copyright Jonah Snider 2018

const { Command } = require('discord.js-commando');
const stocks = require('yahoo-stocks');

module.exports = class LookUpStockCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'look-up-stock',
			group: 'util',
			memberName: 'look-up-stock',
			description: 'Get the price of a stock.',
			aliases: ['stock', 'stock-look-up', 'stocks'],
			examples: ['look-up-stock AAPL'],
			throttling: {
				usages: 4,
				duration: 20
			},
			args: [{
				key: 'symbol',
				prompt: 'What is the ticker symbol of the stock you want to look up?',
				label: 'ticker symbol',
				type: 'string',
				max: 5,
				parse: value => value.toUpperCase()
			}]
		});
	}

	run(msg, { symbol }) {
		try {
			msg.channel.startTyping();

			stocks.lookup(symbol)
				.then(stock =>
					msg.replyEmbed({
						title: `${stock.name} (\`${stock.exchange}: ${stock.symbol}\`)`,
						url: `http://www.nasdaq.com/symbol/${stock.symbol}/real-time`,
						timestamp: new Date(),
						author: {
							name: 'Yahoo! Finance',
							iconURL: 'https://i.imgur.com/LinLXni.png',
							url: 'https://finance.yahoo.com'
						},
						fields: [{
							name: '💰 Price (`USD`)',
							value: `$${stock.currentPrice}`,
							inline: true
						}, {
							name: '💰 High Price (`USD`)',
							value: `$${stock.highPrice}`,
							inline: true
						}, {
							name: '💰 Low Price (`USD`)',
							value: `$${stock.lowPrice}`,
							inline: true
						}, {
							name: '💰 Mean Price (`USD`)',
							value: `$${stock.meanPrice}`,
							inline: true
						}, {
							name: '💰 Median Price (`USD`)',
							value: `$${stock.medianPrice}`,
							inline: true
						}]
					})
				)
				.catch(error => {
					// When stock isn't found it returns true
					if(error === true) {
						return msg.reply('❌ Unknown stock');
					} else {
						return msg.reply(`❌ An unknown error occured with Yahoo Finance (\`${error}\`)`);
					}
				});
		} finally {
			msg.channel.stopTyping();
		}
	}
};
