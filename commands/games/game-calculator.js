// Copyright 2018 Jonah Snider

const config = require('../../config');
const diceAPI = require('../../providers/diceAPI');
const { Command } = require('discord.js-commando');

module.exports = class GameCalculatorCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'game-calculator',
			group: 'games',
			memberName: 'game-calculator',
			description: 'Calculate the odds of winning a dice game.',
			aliases: ['game-calc',
				'game-chance',
				'win-chance',
				'win-percentage',
				'game-percentage',
				'game-percent',
				'win-percent',
				'win-calc'
			],
			examples: ['calculator 4', 'calculator 1.02'],
			args: [
				{
					key: 'multiplier',
					label: 'multiplier',
					prompt: 'What multiplier do you want to check?',
					type: 'float',
					// Round multiplier to second decimal place
					parse: multiplierString => diceAPI.simpleFormat(multiplierString),
					min: config.minMultiplier,
					max: config.maxMultiplier
				}
			],
			throttling: {
				usages: 2,
				duration: 5
			}
		});
	}

	run(msg, { multiplier }) {
		return msg.reply(`🔢 Win Percentage: \`${diceAPI.simpleFormat(diceAPI.winPercentage(multiplier))}%\`.`);
	}
};
