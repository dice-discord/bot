// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const winston = require('winston');

module.exports = class UnbanMemberCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'unban-member',
			aliases: ['unban-user', 'unban', 'un-hack-ban-member', 'un-hack-ban-user'],
			group: 'mod',
			memberName: 'unban-member',
			description: 'Unban a server member',
			details: 'Works with unbanning users who were hackbanned',
			examples: ['unban Zoop', 'unban 208970190547976202'],
			clientPermissions: ['BAN_MEMBERS'],
			userPermissions: ['BAN_MEMBERS'],
			guildOnly: true,
			args: [{
				key: 'user',
				prompt: 'Which user do you want to unban?',
				type: 'user'
			}, {
				key: 'reason',
				prompt: 'What is the reason for unbanning this user?',
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
			}],
			throttling: {
				usages: 2,
				duration: 4
			}
		});
	}

	async run(msg, { user, reason }) {
		try {
			msg.channel.startTyping();

			let banned = false;

			if (reason) {
				reason = `${reason} - Requested by ${msg.author.tag}`;
			} else {
				reason = `Requested by ${msg.author.tag}`;
			}

			// Get all of the bans (from commands) on this guild
			const bansData = await this.client.provider.get(msg.guild, 'bans', {});

			// User is hackbanned
			if (bansData[user.id]) {
				banned = true;
				// Delete the object of the user from the temporary storage
				delete bansData[user.id];
				// Set the bans for the guild to the data modified in this command
				this.client.provider.set(msg.guild, 'bans', bansData);
			}

			// User is regular banned
			winston.debug(`[COMMAND](UNBAN-MEMBER) Bans for ${msg.guild}: ${(await msg.guild.fetchBans()).array()}`);
			winston.debug(`[COMMAND](UNBAN-MEMBER) Is ${user.tag} banned on ${msg.guild}: ${(await msg.guild.fetchBans()).has(user.id)}`);
			if ((await msg.guild.fetchBans()).has(user.id)) {
				banned = true;
				// Unban the user on the guild
				msg.guild.members.unban(user, { reason: reason });
			}

			// Check if the user is actually banned
			if (banned === true) {
				return msg.reply(`🚪 ${user.tag} (\`${user.id}\`) was unbanned for \`${reason}\`.`);
			} else {
				return msg.reply(`❌ ${user.tag} isn't banned.`);
			}
		} finally {
			msg.channel.stopTyping();
		}
	}
};
