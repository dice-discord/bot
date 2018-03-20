// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const { respond } = require('../../providers/simpleCommandResponse');

module.exports = class DeleteSelfRolesCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'delete-self-roles',
			aliases: [
				'self-role-delete',
				'self-roles-delete',
				'delete-self-role',
				'del-self-roles',
				'self-role-del',
				'self-roles-del',
				'del-self-role'
			],
			group: 'selfroles',
			memberName: 'delete-self-roles',
			description: 'Delete a self-assigned role from this server',
			examples: ['delete-self-roles @PUBG', 'delete-self-roles Artists'],
			userPermissions: ['MANAGE_ROLES'],
			guildOnly: true,
			args: [{
				key: 'role',
				prompt: 'What selfrole do you want to delete?',
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
			if(!selfRoles.includes(role.id)) {
				return msg.reply('❌ That role isn\'t a self role.');
			}

			// Check if the author is able to delete the role
			if(role.comparePositionTo(msg.member.roles.highest) >= 0 || !msg.member.hasPermission('ADMINISTRATOR')) {
				return msg.reply('❌ You dont\'t have the permissions to delete that role.');
			}

			// Find the position of the role and delete it from the array
			selfRoles.splice(selfRoles.indexOf(role.id));
			// Set the array to our updated version
			await this.client.provider.set(msg.guild, 'selfRoles', selfRoles);

			// Respond to author with success
			respond(msg);

			return null;
		} finally {
			msg.channel.stopTyping();
		}
	}
};
