// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');

module.exports = class KickMemberCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'kick-member',
			aliases: ['kick-user', 'kick',],
			group: 'mod',
			memberName: 'kick-member',
			description: 'Kick a member from your server',
			examples: ['kick @Zoop', 'kick 213041121700478976', 'kick Zoop Spamming messages'],
			clientPermissions: ['KICK_MEMBERS'],
			userPermissions: ['KICK_MEMBERS'],
			guildOnly: true,
			throttling: {
				usages: 3,
				duration: 6
			},
			args: [{
				key: 'member',
				prompt: 'Which member do you want to kick?',
				type: 'member'
			}, {
				key: 'reason',
				prompt: 'What is the reason for kicking this member?',
				type: 'string',
				label: 'reason for kick',
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

	async run(msg, { member, reason }) {
		try {
            msg.channel.startTyping();
            
			if (reason) {
				reason = `${reason} - Requested by ${msg.author.tag}`;
			} else {
				reason = `Requested by ${msg.author.tag}`;
			}

			if (member.kickable) {
				// Member not on guild or bannable
                await member.kick(reason);

				// React with the success emoji
				msg.react('406965554629574658');
				return null;
			} else {
				// Member not kickable
				return msg.reply('❌ I can\'t kick that member');
			}
		} finally {
			msg.channel.stopTyping();
		}
	}
};
