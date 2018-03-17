// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');

module.exports = class AverageNumbersCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'average-numbers',
			aliases: ['average', 'avg-numbers', 'avg'],
			group: 'util',
			memberName: 'average-numbers',
			description: 'Gets the average of several numbers',
			examples: ['average 55 59 45 61', 'average 5.01 1.01 -8.04 15.067'],
			args: [{
				key: 'numbers',
				prompt: 'What\'s another number you want to be averaged?',
				type: 'float',
				label: 'number',
				infinite: true
			}],
			throttling: {
				usages: 2,
				duration: 6
			}
		});
	}

	run(msg, { numbers }) {
		// Argument checking
		if(numbers.length < 2) return msg.reply('❌ Please provide 2 or more numbers.');

		const reducer = (accumulator, currentValue) => accumulator + currentValue;
		return msg.reply(`🔢 The average is ${numbers.reduce(reducer) / numbers.length}.`);
	}
};
