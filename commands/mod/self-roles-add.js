// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');

module.exports = class SelfRolesAddCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'self-roles-add',
			aliases: ['self-role-add', 'add-self-roles', 'add-self-role'],
			group: 'mod',
			memberName: 'self-roles-add',
			description: 'Add roles to a server\'s selfroles',
			examples: ['self-roles-add @PUBG', 'self-roles-add Artists'],
			userPermissions: ['MANAGE_ROLES'],
			guildOnly: true,
			args: [{
				key: 'role',
				prompt: 'What role do you want to add?',
				type: 'role'
			}]
		});
	}

	async run(msg, { role }) {
		try {
			msg.channel.startTyping();

			// Get all of this guild's selfroles
			const selfRoles = await this.client.provider.get(msg.guild, 'selfRoles', []);

			// Check if the role is already a self role
			if (selfRoles.includes(role.id)) {
				return msg.reply('❌ That role is already a self role.');
			}

			// Add the new role's ID to the local array
			selfRoles.push(role.id);
			// Set the array to our updated version
			await this.client.provider.set(msg.guild, 'selfRoles', selfRoles);
			return msg.reply(`Added '${role.name}' as a selfrole.`);
		} finally {
			msg.channel.stopTyping();
		}
	}
};
