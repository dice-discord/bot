// Copyright Jonah Snider 2018
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const rules = require('../../rules');
const diceAPI = require('../../providers/diceAPI');

module.exports = class DiceGameCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'dice-game',
			group: 'dice',
			memberName: 'dice-game',
			description: 'For each bet the outcome is randomly chosen between 1 and 100. It\'s up to you to guess a target that you think the outcome will exceed.',
			aliases: ['game', 'play', 'play-game', 'dice', 'play-dice'],
			examples: ['dice 250 4'],
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
				usages: 1,
				duration: 1
			}
		});
	}

	async run(msg, { wager, multiplier }) {
		try {
			msg.channel.startTyping();
			const authorBalance = await diceAPI.getBalance(msg.author.id);

			// Wager checking
			if (wager > authorBalance) {
				return msg.reply(`❌ You are missing \`${wager - authorBalance}\` ${rules.currencyPlural}. Your balance is \`${authorBalance}\` ${rules.currencyPlural}.`);
			} else if (wager * multiplier - wager > (await diceAPI.getBalance(this.client.user.id))) {
				return msg.reply('❌ I couldn\'t pay your winnings if you won.');
			}

			// Take away the player's wager no matter what
			diceAPI.decreaseBalance(msg.author.id, wager);
			// Give the wager to the house
			diceAPI.increaseBalance(this.client.user.id, wager);

			// Round numbers to second decimal place
			const randomNumber = diceAPI.simpleFormat(Math.random() * rules.maxMultiplier);

			// Get boolean if the random number is greater than the multiplier
			const gameResult = randomNumber > diceAPI.winPercentage(multiplier);

			// Variables for later use
			const profit = diceAPI.simpleFormat(wager * multiplier - wager);

			if (gameResult === false) {
			// Give the player their winnings
				await diceAPI.increaseBalance(msg.author.id, wager * multiplier);
				// Take the winnings from the house
				await diceAPI.decreaseBalance(this.client.user.id, wager * multiplier);
			}

			const embed = new MessageEmbed({
				title: `**${wager} 🇽 ${multiplier}**`,
				fields: [{
					name: '🔢 Random Number Result',
					value: `${randomNumber}`,
					inline: true
				},
				{
					name: '🏦 Updated Balance',
					value: `${await diceAPI.getBalance(msg.author.id)} ${rules.currencyPlural}`,
					inline: true
				},
				{
					name: '💵 Wager',
					value: `${wager}`,
					inline: true
				},
				{
					name: '🇽 Multiplier',
					value: `${multiplier}`,
					inline: true
				}
				]
			});

			if (gameResult === true) {
			// Red color and loss message
				embed.setColor(0xf44334);
				embed.setDescription(`You lost \`${wager}\` ${rules.currencyPlural}.`);
			} else {
			// Green color and win message
				embed.setColor(0x4caf50);

				embed.setDescription(`You made \`${profit}\` ${rules.currencyPlural} of profit!`);
				if ((await diceAPI.getBiggestWin) <= profit) {
					diceAPI.updateBiggestWin(msg.author.id, profit);
				}
			}

			return msg.replyEmbed(embed);
		} finally {
			msg.channel.stopTyping();
		}
	}
};
