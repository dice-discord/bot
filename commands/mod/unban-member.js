// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');

module.exports = class UnbanMemberCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'unban-member',
			aliases: ['unban-user', 'unban'],
			group: 'mod',
			memberName: 'unban-member',
			description: 'Unban a server member',
			examples: ['unban Zoop', 'unban 208970190547976202'],
			clientPermissions: ['BAN_MEMBERS'],
			userPermissions: ['BAN_MEMBERS'],
			guildOnly: true,
			args: [{
				key: 'member',
				prompt: 'Which member do you want to ban?',
				type: 'member',
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

	run(msg, { member, reason }) {
        if (reason) {
			reason += ` - Requested by ${msg.author.tag}`;
		} else {
			reason = `Requested by ${msg.author.tag}`;
		}
		msg.guild.members.unban(member, { reason: reason })
			.then((unbannedMember) => {
			    return msg.reply(`🚪 ${unbannedMember} was unbanned for \`${reason}\`.`);
			});

	}
};
