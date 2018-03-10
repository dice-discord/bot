// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const response = require('../../providers/simpleCommandResponse');

module.exports = class RemoveSelfRolesCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'remove-self-roles',
			aliases: ['self-role-remove', 'self-roles-remove', 'remove-self-role'],
			group: 'util',
			memberName: 'remove-self-roles',
			description: 'Remove a self-assigned role from yourself',
			examples: ['remove-self-roles @PUBG', 'remove-self-roles Artists'],
			clientPermissions: ['MANAGE_ROLES'],
			guildOnly: true,
			args: [{
				key: 'role',
				prompt: 'Which of your selfroles do you want to remove?',
				type: 'role'
			}],
			throttling: {
				usages: 2,
				duration: 4
			}
		});
	}

	async run(msg, { role }) {
		try {
			msg.channel.startTyping();

			// Get all of this guild's selfroles
			const selfRoles = this.client.provider.get(msg.guild, 'selfRoles', []);

			// Check if the role isn't a self role
			if (!selfRoles.includes(role.id)) {
				return msg.reply('❌ That role isn\'t a self role.');
			}

			if (!msg.member.roles.has(role.id)) {
				return msg.reply('❌ You don\'t have that role.');
			}

			await msg.member.roles.remove(role.id, 'Selfrole');

			// Respond to author with success
			response.respond(msg);
		} finally {
			msg.channel.stopTyping();
		}
	}
};
