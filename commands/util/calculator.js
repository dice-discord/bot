// Copyright Jonah Snider 2018

const rules = require('../../rules');
const diceAPI = require('../../diceAPI');
const { Command } = require('discord.js-commando');

module.exports = class CalculatorCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'calculator',
			group: 'util',
			memberName: 'calculator',
			description: 'Calculate the odds of winning a game.',
			aliases: ['calc', 'chance', 'win-chance', 'win-percentage', 'percentage', 'percent'],
			examples: ['calculator'],
			args: [
				{
					key: 'multiplier',
					label: 'multiplier',
					prompt: 'How much do you want to multiply your wager by?',
					type: 'float',
					// Round multiplier to second decimal place
					parse: multiplierString => diceAPI.simpleFormat(multiplierString),
					min: rules.minMultiplier,
					max: rules.maxMultiplier
				}
			]
		});
	}

	run(msg, { multiplier }) {
		return msg.reply(`🔢 Win Percentage: \`${diceAPI.simpleFormat(diceAPI.winPercentage(multiplier))}%\`.`);
	}
};
