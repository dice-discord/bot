// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');

module.exports = class BanMemberCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ban-member',
			aliases: ['ban-user', 'ban'],
			group: 'mod',
			memberName: 'ban-member',
			description: 'Bulk delete messages in a text channel',
			examples: ['bulk-delete 20'],
			clientPermissions: ['BAN_MEMBERS'],
			userPermissions: ['BAN_MEMBERS'],
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

		if (member.bannable && days !== 0 && reason) {
			// Member can be banned, reason and days specified
			member.ban({ reason: reason, days: days })
				.then((bannedMember) => {
					return msg.reply(`🚪 ${bannedMember} was banned for \`${reason}\`. \`${days}\` days of their messages were deleted.`);
				});
		} else if (member.bannable && reason) {
			// Member can be banned, reason specified, and days unspecified
			member.ban({ reason: reason })
				.then((bannedMember) => {
					return msg.reply(`🚪 ${bannedMember} was banned for \`${reason}\`.`);
				});
		} else if (member.bannable) {
			// Member can be banned, reason and days unspecified
			member.ban({ reason: reason })
				.then((bannedMember) => {
					return msg.reply(`🚪 ${bannedMember} was banned.`);
				});
		} else {
			return msg.reply('❌ Unable to ban that member');
		}

	}
};
