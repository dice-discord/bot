// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const rules = require('../../rules');
const diceAPI = require('../../providers/diceAPI');

module.exports = class SimulateCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'simulate',
			group: 'games',
			memberName: 'simulate',
			description: 'Simulate a game of dice',
			aliases: ['practice', 'practice-game', 'sim', 'simulate-game', 'sim-game', 'simulate-dice', 'sim-dice'],
			examples: ['simulate 250 4', 'sim 23 2.01'],
			args: [{
				key: 'wager',
				prompt: 'How much do you want to wager? (whole number)',
				type: 'integer',
				min: rules.minWager
			},
			{
				key: 'multiplier',
				prompt: 'How much do you want to multiply your wager by?',
				type: 'float',
				// Round multiplier to second decimal place
				parse: multiplier => diceAPI.simpleFormat(multiplier),
				min: rules.minMultilpier,
				max: rules.maxMultiplier
			}
			],
			throttling: {
				usages: 2,
				duration: 1
			}
		});
	}

	run(msg, { wager, multiplier }) {
		// Round numbers to second decimal place
		const randomNumber = diceAPI.simpleFormat(Math.random() * rules.maxMultiplier);

		// Get boolean if the random number is greater than the multiplier
		const gameResult = randomNumber > diceAPI.winPercentage(multiplier);

		const embed = new MessageEmbed({
			title: `**${wager} 🇽 ${multiplier}**`,
			fields: [{
				name: '🔢 Random Number Result',
				value: randomNumber.toString(),
				inline: true
			},
			{
				name: '📊 Win Chance',
				value: `${diceAPI.simpleFormat(diceAPI.winPercentage(multiplier))}%`,
				inline: true
			},
			{
				name: '💵 Wager',
				value: wager.toString(),
				inline: true
			},
			{
				name: '🇽 Multiplier',
				value: multiplier.toString(),
				inline: true
			}
			]
		});

		if (gameResult === true) {
			// Red color and loss message
			embed.setColor(0xf44334);
			embed.setDescription(`You would have lost \`${wager}\` ${rules.currencyPlural}.`);
		} else {
			// Green color and win message
			embed.setColor(0x4caf50);
			embed.setDescription(`Your profit would have been \`${diceAPI.simpleFormat(wager * multiplier - wager)}\` ${rules.currencyPlural}!`);
		}

		return msg.replyEmbed(embed);
	}
};
