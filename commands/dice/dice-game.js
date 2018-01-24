const { Command } = require('discord.js-commando');
const rules = require('../../rules');
const winston = require('winston');
const diceAPI = require('../../diceAPI');

module.exports = class DiceGameCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'dice-game',
			group: 'dice',
			memberName: 'dice-game',
			description:
				// prettier-ignore
				'For each bet the outcome is randomly chosen between 1 and 100. It\'s up to you to guess a target that you think the outcome will exceed.',
			aliases: ['game', 'play', 'play-game', 'dice', 'play-dice'],
			examples: ['dice 250 4'],
			args: [
				{
					key: 'wager',
					prompt: 'How much do you want to wager?',
					type: 'string',
					// Round wager by converting to simple string and then round
					parse: wagerString => Math.round(diceAPI.simpleStringFormat(wagerString)),
				},
				{
					key: 'multiplier',
					prompt: 'How much do you want to multiply your wager by?',
					type: 'string',
					// Round multiplier to second decimal place
					parse: multiplierString => diceAPI.simpleStringFormat(multiplierString),
				},
			],
			throttling: {
				usages: 1,
				duration: 1,
			},
		});
	}

	async run(msg, { wager, multiplier }) {
		const authorBalance = await diceAPI.getBalance(msg.author.id);
		winston.level = 'info';

		// Multiplier checking
		if (multiplier < diceAPI.simpleFormat(rules.minMultiplier)) {
			return msg.reply(`❌ Your target multiplier must be at least \`${rules.minMultiplier}\`.`);
		} else if (multiplier > diceAPI.simpleFormat(rules.maxMultiplier)) {
			return msg.reply(`❌ Your target multiplier must be less than \`${rules.maxMultiplier}\`.`);
		} else if (isNaN(multiplier)) {
			return msg.reply(`❌ \`${multiplier}\` is not a valid number.`);
		}

		// Wager checking
		if (wager < rules.minWager) {
			return msg.reply(
				`❌ Your wager must be at least \`${rules.minWager}\` ${rules.currencyPlural}.`
			);
		} else if (wager > authorBalance) {
			return msg.reply(
				`❌ You are missing \`${wager - authorBalance}\` ${
					rules.currencyPlural
				}. Your balance is \`${authorBalance}\` ${rules.currencyPlural}.`
			);
		} else if (wager * multiplier - wager > (await diceAPI.getBalance(rules.houseID))) {
			// prettier-ignore
			return msg.reply('❌ I couldn\'t pay your winnings if you won.');
		} else if (isNaN(wager)) {
			return msg.reply(`❌ \`${wager}\` is not a valid number.`);
		}

		// Round numbers to second decimal place
		const randomNumber = diceAPI.simpleFormat(Math.random() * rules.maxMultiplier);

		// Get boolean if the random number is greater than the multiplier
		const gameResult = randomNumber > diceAPI.winPercentage(multiplier);

		// Take away the player's wager no matter what
		await diceAPI.decreaseBalance(msg.author.id, wager);
		// Give the wager to the house
		await diceAPI.increaseBalance(rules.houseID, wager);

		// Variables for later use in embed
		let color;
		let result;
		const profit = diceAPI.simpleFormat(wager * multiplier - wager);

		if (gameResult === true) {
			// Red color and loss message
			color = 0xf44334;
			result = `You lost \`${wager}\` ${rules.currencyPlural}.`;
		} else {
			// Give the player their winnings
			await diceAPI.increaseBalance(msg.author.id, wager * multiplier);
			// Take the winnings from the house
			await diceAPI.decreaseBalance(rules.houseID, wager * multiplier);

			// Green color and win message
			color = 0x4caf50;
			result = `You made \`${profit}\` ${rules.currencyPlural} of profit!`;
		}

		msg.say({
			embed: {
				title: `**${wager} 🇽 ${multiplier}**`,
				color: color,
				fields: [
					{
						name: '🎲 Result',
						value: result,
					},
					{
						name: '🔢 Random Number Result',
						value: `${randomNumber}`,
						inline: true,
					},
					{
						name: '🏦 Updated Balance',
						value: `${await diceAPI.getBalance(msg.author.id)} ${rules.currencyPlural}`,
						inline: true,
					},
					{
						name: '💵 Wager',
						value: `${wager}`,
						inline: true,
					},
					{
						name: '🇽 Multiplier',
						value: `${multiplier}`,
						inline: true,
					},
				],
			},
		});
	}
};
