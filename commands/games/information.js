// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const winston = require('winston');
const config = require('../../config');
const diceAPI = require('../../providers/diceAPI');

module.exports = class InformationCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'information',
			group: 'games',
			memberName: 'information',
			description: 'Get information on a user.',
			aliases: ['user-info', 'user-profile', 'profile', 'info', 'user-information'],
			examples: ['info', 'information PizzaFox'],
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					key: 'user',
					prompt: 'Who\'s profile do you want to look up?',
					type: 'user',
					default: ''
				}
			],
			throttling: {
				usages: 2,
				duration: 20
			}
		});
	}

	async run(msg, { user }) {
		try {
			msg.channel.startTyping();

			user = user || msg.author;

			// Make sure the target user isn't a bot (excluding the client)
			if(user.bot && user.id !== this.client.user.id) {
				return msg.reply('❌ Bots can\'t play.');
			}

			const userBalance = await diceAPI.getBalance(user.id);
			const userProfilePicture = user.displayAvatarURL(128);
			let startingBalance;

			// Determine what the starting balance is for the requested user
			if(user.id === this.client.user.id) {
				startingBalance = config.houseStartingBalance;
			} else {
				startingBalance = config.newUserBalance;
			}

			winston.verbose(`[COMMAND](INFO) Target user display URL: ${userProfilePicture}`);

			return msg.replyEmbed({
				title: user.tag,
				thumbnail: { url: userProfilePicture },
				fields: [
					{
						name: '💰 Total Profit',
						value: `${diceAPI.simpleFormat(userBalance - startingBalance).toLocaleString()} ${config.currency.plural}`,
						inline: true
					},
					{
						name: '🏦 Balance',
						value: `${userBalance.toLocaleString()} ${config.currency.plural}`,
						inline: true
					}
				]
			});
		} finally {
			msg.channel.stopTyping();
		}
	}
};
