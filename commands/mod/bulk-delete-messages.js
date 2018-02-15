// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');

module.exports = class BulkDeleteMessagesCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'bulk-delete-messages',
			aliases: ['prune', 'message-prune', 'message-bulk-delete', 'delete-messages', 'messages-prune', 'messages-bulk-delete', 'bulk-delete'],
			group: 'mod',
			memberName: 'bulk-delete-messages',
			description: 'Bulk delete messages in a text channel',
			examples: ['bulk-delete-messages 20'],
			clientPermissions: ['MANAGE_MESSAGES'],
			userPermissions: ['MANAGE_MESSAGES'],
			guildOnly: true,
			args: [{
				key: 'messageCount',
				prompt: 'How many messages do you want to delete?',
				type: 'integer',
				min: 1,
				max: 100,
				label: 'message count'
			}]
		});
	}

	async run(msg, { messageCount }) {
		try {
			msg.channel.startTyping();

			msg.delete();
			const messagesToDelete = await msg.channel.messages.fetch({ limit: messageCount });
			msg.channel.bulkDelete(messagesToDelete)
				.then((messages) => {
					return msg.reply(`🗑 \`${messages.size}\` messages deleted.`);
				});
		} finally {
			msg.channel.stopTyping();
		}
	}
};
