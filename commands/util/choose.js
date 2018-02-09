const { Command } = require('discord.js-commando');
const winston = require('winston');

module.exports = class ChooseCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'choose',
			aliases: ['select', 'pick'],
			group: 'util',
			memberName: 'choose',
			description: 'Choose something from a list you provide.',
			examples: ['choose red | blue | yellow | green'],
			args: [
				{
					key: 'options',
					prompt: 'What do you want to select?',
					type: 'string',
          			infinite: true
				}
			]
		});
	}

	run(msg, { options }) {
		// Argument checking
		if (options.length < 2) return msg.reply('❌ Please provide 2 or more options.');

		const randomNumber = Math.floor(Math.random() * (options.length - 0) + 0);
		

		return msg.reply(`I choose #${randomNumber + 1}, ${options[randomNumber]}.`);
	}
};
