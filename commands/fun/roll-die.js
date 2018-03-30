// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');

module.exports = class RollDieCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'roll-die',
			aliases: ['roll-dice', 'die', 'dice'],
			group: 'fun',
			memberName: 'roll-die',
			description: 'Roll a die.',
			examples: ['roll-die', 'roll-die 20'],
			args: [{
				key: 'sides',
				prompt: 'How many sides do you want your die to have?',
				type: 'integer',
				label: 'number of die sides',
				default: 6,
				min: 1
			}],
			throttling: {
				usages: 2,
				duration: 6
			}
		});
	}

	run(msg, { sides }) {
		const randomNumber = Math.floor(Math.random() * sides);

		return msg.reply(`🎲 You rolled a ${randomNumber}.`);
	}
};
