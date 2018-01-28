const packageData = require('../../package');
const rules = require('../../rules');
const { Command } = require('discord.js-commando');

module.exports = class CheckVersionCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'check-version',
			group: 'dev',
			memberName: 'check-version',
			description: `Checks what version <@${rules.houseID}> is.`,
			aliases: ['version-check', 'version'],
			examples: ['check-version'],
			throttling: {
				usages: 1,
				duration: 30,
			},
		});
	}

	run(msg) {
		return msg.reply(`${this.client.user} version \`${packageData.version}\`.`);
	}
};
