// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const { respond } = require('../../providers/simpleCommandResponse');

module.exports = class RemoveSelfRoleCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'remove-self-role',
			aliases: ['self-role-remove', 'self-roles-remove', 'remove-self-roles'],
			group: 'selfroles',
			memberName: 'remove-self-role',
			description: 'Remove a self-assigned role from yourself.',
			examples: ['remove-self-role @PUBG', 'remove-self-role Artists'],
			clientPermissions: ['MANAGE_ROLES'],
			guildOnly: true,
			args: [{
				key: 'role',
				prompt: 'Which of your self roles do you want to remove?',
				type: 'role'
			}],
			throttling: {
				usages: 2,
				duration: 4
			}
		});
	}

	async run(msg, { role }) {
		// Get all of this guild's selfroles
		const selfRoles = this.client.provider.get(msg.guild, 'selfRoles', []);

			// Check if the role isn't a self role
		if(!selfRoles.includes(role.id)) {
			return msg.reply('❌ That role isn\'t a self role.');
		}

		if(!msg.member.roles.has(role.id)) {
			return msg.reply('❌ You don\'t have that role.');
		}

		await msg.member.roles.remove(role.id, 'Selfrole');

			// Respond to author with success
		respond(msg);

		return null;
	}
};
