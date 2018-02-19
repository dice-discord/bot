// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const rules = require('../../rules');

module.exports = class HackBanUserCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'hack-ban-user',
			aliases: ['hack-ban-member', 'hack-ban'],
			group: 'mod',
			memberName: 'hack-ban-user',
			description: 'Ban a user before they\'ve even joined your server (hackban)',
			details: `This will only work if <@${rules.houseID}> is on your server when the user tries joining and if they can be banned when they join`,
			examples: ['hack-ban @Zoop', 'hack-ban 172002275412279296 Spamming messages'],
			guildOnly: true,
			clientPermissions: ['BAN_MEMBERS'],
			userPermissions: ['BAN_MEMBERS'],
			throttling: {
				usages: 2,
				duration: 4
			},
			args: [{
				key: 'user',
				prompt: 'What user do you want to ban?',
				type: 'user'
			}, {
				key: 'reason',
				prompt: 'What is the reason for banning this user?',
				type: 'string',
				label: 'reason for ban',
				default: '',
				validate: reason => {
					if (reason.length > 400) {
						return `Your reason was ${reason.length} characters long. Please limit your reason to 400 characters.`;
					} else {
						return true;
					}
				}
			}]
		});
	}

	async run(msg, { user, reason }) {
		try {
			msg.channel.startTyping();

			// Note that hackbans are different than regular bans because they ban a user before they are a server member, hence the variable name differences
			if (reason) {
				reason += ` - Requested by ${msg.author.tag} on ${new Date(msg.createdAt)}`;
			} else {
				reason = `Requested by ${msg.author.tag} on ${new Date(msg.createdAt)}`;
			}

			// Get all of the bans (from commands) on this guild
			const bansData = await this.client.provider.get(msg.guild, 'bans', {});
			if (bansData[user.id] && bansData[user.id].banned) {
				return msg.reply('❌ That user is already banned.');
			} else {
				// Update the object of the user from the temporary storage
				bansData[user.id] = { banned: true, reason: reason, tag: user.tag, id: user.id };
				// Set the bans for the guild to the data modified in this command
				this.client.provider.set(msg.guild, 'bans', bansData);

				return msg.reply(`🚪 If ${user.tag} joins this server, they will be banned for \`${reason}\`.`);
			}
		} finally {
			msg.channel.stopTyping();
		}
	}
};
