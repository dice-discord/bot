const { ArgumentType } = require('discord.js-commando');

class RegexArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'regex');
	}

	validate(value) {
		return /\/{1}.+\/{1}[a-z]*/g.test(value);
	}
}

module.exports = RegexArgumentType;
