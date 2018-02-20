// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');

module.exports = class DeleteSelfRolesCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'delete-self-roles',
			aliases: ['self-role-delete', 'self-roles-delete', 'delete-self-role', 'remove-self-roles', 'self-role-remove', 'self-roles-remove', 'remove-self-role'],
			group: 'mod',
			memberName: 'delete-self-roles',
			description: 'Delete a self-assigned role from this server',
			examples: ['delete-self-roles @PUBG', 'delete-self-roles Artists'],
			userPermissions: ['MANAGE_ROLES'],
			guildOnly: true,
			args: [{
				key: 'role',
				prompt: 'What role do you want to delete?',
				type: 'role'
			}]
		});
	}

	async run(msg, { role }) {
		try {
			msg.channel.startTyping();

			// Get all of this guild's selfroles
			const selfRoles = await this.client.provider.get(msg.guild, 'selfRoles', []);

			// Check if the role isn't a self role
			if (!selfRoles.includes(role.id)) {
				return msg.reply('❌ That role isn\'t a self role.');
			}

			// Find the position of the role and delete it from the array
			selfRoles.splice(selfRoles.indexOf(role.id));
			// Set the array to our updated version
			await this.client.provider.set(msg.guild, 'selfRoles', selfRoles);

			return msg.reply(`Removed '${role.name}' as a selfrole.`);
		} finally {
			msg.channel.stopTyping();
		}
	}
};
