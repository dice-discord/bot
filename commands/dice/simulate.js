const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const rules = require('../../rules');
const diceAPI = require('../../diceAPI');

module.exports = class SimulateGameCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'simulate',
			group: 'dice',
			memberName: 'simulate',
			description: 'Simulate a game of dice',
			aliases: [
				'practice',
				'practice-game',
				'sim',
				'simulate-game',
				'sim-game',
				'simulate-dice',
				'sim-dice',
			],
			examples: ['simulate 250 4', 'sim 23 2.01'],
			args: [
				{
					key: 'wager',
					prompt: 'How much do you want to wager? (whole number)',
					type: 'integer',
				},
				{
					key: 'multiplier',
					prompt: 'How much do you want to multiply your wager by?',
					type: 'float',
					// Round multiplier to second decimal place
					parse: multiplier => diceAPI.simpleFormat(multiplier),
				},
			],
			throttling: {
				usages: 1,
				duration: 1,
			},
		});
	}

	run(msg, { wager, multiplier }) {
		// Multiplier checking
		if (multiplier < diceAPI.simpleFormat(rules.minMultiplier)) {
			return msg.reply(`❌ Your target multiplier must be at least \`${rules.minMultiplier}\`.`);
		} else if (multiplier > diceAPI.simpleFormat(rules.maxMultiplier)) {
			return msg.reply(`❌ Your target multiplier must be less than \`${rules.maxMultiplier}\`.`);
		}

		// Wager checking
		if (wager < rules.minWager) {
			// prettier-ignore
			return msg.reply(`❌ Your wager must be at least \`${rules.minWager}\` ${rules.currencyPlural}.`);
		}

		// Round numbers to second decimal place
		const randomNumber = diceAPI.simpleFormat(Math.random() * rules.maxMultiplier);

		// Get boolean if the random number is greater than the multiplier
		const gameResult = randomNumber > diceAPI.winPercentage(multiplier);

		const embed = new MessageEmbed({
			title: `**${wager} 🇽 ${multiplier}**`,
			fields: [
				{
					name: '🔢 Random Number Result',
					value: randomNumber.toString(),
					inline: true,
				},
				{
					name: '📊 Win Chance',
					value: `${diceAPI.simpleFormat(diceAPI.winPercentage(multiplier))}%`,
					inline: true,
				},
				{
					name: '💵 Wager',
					value: wager.toString(),
					inline: true,
				},
				{
					name: '🇽 Multiplier',
					value: multiplier.toString(),
					inline: true,
				},
			],
		});

		if (gameResult === true) {
			// Red color and loss message
			embed.setColor(0xf44334);
			embed.addField('🎲 Result', `You would have lost \`${wager}\` ${rules.currencyPlural}.`);
		} else {
			// Green color and win message
			embed.setColor(0x4caf50);
			// prettier-ignore
			embed.addField('🎲 Result', `Your profit would have been \`${diceAPI.simpleFormat(wager * multiplier - wager)}\` ${rules.currencyPlural}!`);
		}

		// Rearrange fields
		const tempField = embed.fields[4];
		embed.fields[4] = embed.fields[0];
		embed.fields[0] = tempField;

		msg.say(embed);
	}
};
