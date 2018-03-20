// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const { respond } = require('../../providers/simpleCommandResponse');

module.exports = class DeleteSelfRolesCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'delete-role',
			aliases: [
				'role-delete',
				'roles-delete',
				'delete-roles',
				'del-roles',
				'role-del',
				'roles-del',
				'del-role'
			],
			group: 'mod',
			memberName: 'delete-role',
			description: 'Delete a role from this server',
			examples: ['delete-role @PUBG', 'delete-role Artists'],
			userPermissions: ['MANAGE_ROLES'],
			guildOnly: true,
			args: [{
				key: 'role',
				prompt: 'What role do you want to delete?',
				type: 'role'
			}],
			throttling: {
				usages: 2,
				duration: 4
			}
		});
	}

	async run(msg, { role }) {
		// Check if the author is able to delete the role
		if(role.comparePositionTo(msg.member.roles.highest) >= 0 || !msg.member.hasPermission('ADMINISTRATOR')) {
			return msg.reply('❌ You dont\'t have the permissions to delete that role.');
		}

        role.delete(`Requested by ${msg.author.tag}`)
            // Respond to author with success
            .then(() => {
                respond(msg);
                return null;
            })
            .catch(() => { return msg.reply('❌ Unable to delete that role.'); });

		
	}
};
