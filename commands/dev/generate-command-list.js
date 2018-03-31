// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');

module.exports = class GenerateCommandListCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'generate-command-list',
			group: 'dev',
			memberName: 'generate-command-list',
			description: 'Creates a Markdown table of all commands.',
			details: 'Only the bot owner(s) may use this command.',
			aliases: ['command-list', 'make-command-list'],
			throttling: {
				usages: 2,
				duration: 15
			},
			ownerOnly: true
		});
	}

	run(msg) {
		const groups = this.client.registry.groups;

		msg.say(groups.filter(grp => grp.commands)
		// eslint-disable-next-line max-len
		.map(grp => `${grp.commands.filter(cmd => !cmd.ownerOnly).map(cmd => `|[\\\`${cmd.name}\\\`](/commands/${cmd.group.name.toLowerCase()}/${cmd.name})|${cmd.description}|${cmd.group.name}|`).join('\n')}`), { split: true });
	}
};
