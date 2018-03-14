// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const response = require('../../providers/simpleCommandResponse');

module.exports = class SelfRolesAddCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'self-roles-add',
			aliases: ['self-role-add', 'add-self-roles', 'add-self-role'],
			group: 'selfroles',
			memberName: 'self-roles-add',
			description: 'Add roles to a server\'s selfroles',
			examples: ['self-roles-add @PUBG', 'self-roles-add Artists'],
			userPermissions: ['MANAGE_ROLES'],
			guildOnly: true,
			args: [{
				key: 'role',
				prompt: 'What role do you want to add?',
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

			// Check if the role is already a self role
			if (selfRoles.includes(role.id)) {
				return msg.reply('❌ That role is already a self role.');
			}

			// Check if the author is able to add the role
			if (role.comparePositionTo(msg.member.roles.highest) >= 0 || !msg.member.hasPermission('ADMINISTRATOR')) {
				return msg.reply('❌ You dont\'t have the permissions to add that role.');
			}

			// Check if bot is able to add that role
			if (role.comparePositionTo(msg.guild.me.roles.highest) >= 0) {
				return msg.reply('❌ I dont\'t have the permissions to add that role.');
			}

			// Check if role is managed by an integration
			if (role.managed) {
				return msg.reply('❌ An integration is managing that role.');
			}

			// Add the new role's ID to the local array
			selfRoles.push(role.id);
			// Set the array to our updated version
			await this.client.provider.set(msg.guild, 'selfRoles', selfRoles);

			// Respond to author with success
			response.respond(msg);
		} finally {
			msg.channel.stopTyping();
		}
	}
};
