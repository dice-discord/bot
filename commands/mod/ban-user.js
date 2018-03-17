// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const { respond } = require('../../providers/simpleCommandResponse');

module.exports = class BanUserCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ban-user',
			aliases: ['ban', 'ban-member', 'hackban-user', 'hackban-member', 'hackban'],
			group: 'mod',
			memberName: 'ban-user',
			description: 'Ban any user from your server',
			examples: ['ban @Zoop', 'ban 213041121700478976', 'ban Zoop Spamming messages'],
			clientPermissions: ['BAN_MEMBERS'],
			userPermissions: ['BAN_MEMBERS'],
			guildOnly: true,
			throttling: {
				usages: 3,
				duration: 6
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
				max: 400
			}]
		});
	}

	run(msg, { user, reason }) {
		if(reason) {
			reason = `${reason} - Requested by ${msg.author.tag}`;
		} else {
			reason = `Requested by ${msg.author.tag}`;
		}
		msg.guild.members.ban(user.id, { reason: reason })
			.then(() => respond(msg))
			.catch(() => msg.reply('❌ Unable to ban that user'));
	}
};
