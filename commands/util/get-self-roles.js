// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');

module.exports = class GetSelfRolesCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'get-self-roles',
			aliases: ['self-role-get', 'self-roles-get', 'get-self-role'],
			group: 'util',
			memberName: 'get-self-roles',
			description: 'Get a self-assigned role from this server',
			examples: ['get-self-roles @PUBG', 'get-self-roles Artists'],
			clientPermissions: ['MANAGE_ROLES'],
			guildOnly: true,
			args: [{
				key: 'role',
				prompt: 'What role do you want to get?',
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

			// Check if author already has the role
			if (msg.member.roles.has(role.id)) {
				return msg.reply('❌ You already have that role.');
			}

			// Check if bot is able to add that role
			if (role.comparePositionTo(msg.guild.me.roles.highest) >= 0 || msg.member.manageable === false) {
				return msg.reply('❌ I dont\'t have the permissions to give you that role.');
			}

			await msg.member.roles.add(role.id, 'Selfrole');
			// React with the success emoji
			msg.react('406965554629574658');
			return null;
		} finally {
			msg.channel.stopTyping();
		}
	}
};
