// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');

module.exports = class HackBanUserCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'hack-ban-user',
			aliases: ['hack-ban-member', 'hack-ban'],
			group: 'mod',
			memberName: 'hack-ban-user',
			description: 'Ban a user before they\'ve even joined your server (hackban)',
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
				type: 'user',
				label: 'server member'
			}, {
				key: 'reason',
				prompt: 'What is the reason for banning this member?',
				type: 'string',
				label: 'reason for ban',
				default: ''
			}]
		});
	}

	run(msg, { user, reason }) {
		if (reason) {
			reason += ` - Requested by ${msg.author.tag} on ${new Date(msg.createdAt)}`;
		} else {
			reason = `Requested by ${msg.author.tag} on ${new Date(msg.createdAt)}`;
		}

		if (member.bannable) {
			// Member can be banned
			this.client.provider.set(msg.guild, `banned${user.id}`, { banned: true, reason: reason});

			return msg.reply(`🚪 If ${member} joins this server, they will be banned for \`${reason}\`.`);
		} else {
			return msg.reply('❌ Unable to ban that user');
		}

	}
};
