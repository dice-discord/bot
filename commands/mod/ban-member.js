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
				default: ''
			}]
		});
	}

	run(msg, { member, days, reason }) {
		if (reason) {
			reason += ` - Requested by ${msg.author.tag}`;
		} else {
			reason = `Requested by ${msg.author.tag}`;
		}

		if (member.bannable && days !== 0) {
			// Member can be banned, reason and days specified
			this.client.provider.set(msg.guild, `banned${user.id}`, { banned: true, reason: reason });
			member.ban({ reason: reason, days: days })
				.then((bannedMember) => {
					return msg.reply(`🚪 ${bannedMember} was banned for \`${reason}\`. \`${days}\` days of their messages were deleted.`);
				});
		} else if (member.bannable) {
			// Member can be banned, reason specified, and days unspecified
			this.client.provider.set(msg.guild, `banned${user.id}`, { banned: true, reason: reason });
			member.ban({ reason: reason })
				.then((bannedMember) => {
					return msg.reply(`🚪 ${bannedMember} was banned for \`${reason}\`.`);
				});
		} else {
			return msg.reply('❌ Unable to ban that member');
		}

	}
};
