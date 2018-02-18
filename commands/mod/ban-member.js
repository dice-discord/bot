// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');

module.exports = class BanMemberCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ban-member',
			aliases: ['ban-user', 'ban'],
			group: 'mod',
			memberName: 'ban-member',
			description: 'Ban a server member',
			examples: ['ban Zoop', 'ban Zoop 7 Spamming messages'],
			clientPermissions: ['BAN_MEMBERS'],
			userPermissions: ['BAN_MEMBERS'],
			guildOnly: true,
			args: [{
				key: 'member',
				prompt: 'Which member do you want to ban?',
				type: 'member',
				label: 'server member'
			}, {
				key: 'days',
				prompt: 'How many days of messages do you want to delete?',
				type: 'integer',
				label: 'days of messages to delete',
				default: 0,
				min: 0
			}, {
				key: 'reason',
				prompt: 'What is the reason for banning this member?',
				type: 'string',
				label: 'reason for ban',
				default: '',
				validate: reason => {
					if (reason.length > 400) {
						return `Your reason was ${reason.length} characters long. Please limit your title to 400 characters.`;
					} else {
						return true;
					}
				}
			}]
		});
	}

	run(msg, { member, days, reason }) {
		try {
			msg.channel.startTyping();
			if (reason) {
				reason += ` - Requested by ${msg.author.tag}`;
			} else {
				reason = `Requested by ${msg.author.tag}`;
			}

			if (member.bannable && days !== 0) {
				// Member can be banned, and days specified
				msg.guild.members.ban(member, { reason: reason, days: days })
					.then((bannedMember) => {
						return msg.reply(`🚪 ${bannedMember} was banned for \`${reason}\`. \`${days}\` days of their messages were deleted.`);
					});
			} else if (member.bannable) {
				// Member can be banned, and days unspecified
				msg.guild.members.ban(member, { reason: reason })
					.then((bannedMember) => {
						return msg.reply(`🚪 ${bannedMember} was banned for \`${reason}\`.`);
					});
			} else {
				return msg.reply('❌ I don\'t have the permissions to ban that member');
			}
		} finally {
			msg.channel.stopTyping();
		}
	}
};
