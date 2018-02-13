// Copyright 2018 Jonah Snider

const moment = require('moment');
const { Command } = require('discord.js-commando');
const rules = require('../../rules');

module.exports = class AccountAgeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'account-age',
			group: 'util',
			memberName: 'account-age',
			description: 'Check when an account was created',
			aliases: ['age', 'account-created'],
			examples: ['account-age', `account-age <@${rules.houseID}>`],
			args: [{
				key: 'user',
				prompt: 'Who do you want to check?',
				type: 'user',
				default: ''
			}]
		});
	}

	run(msg, { user }) {
		const target = user || msg.author;
		return msg.reply(`⏰ ${moment.duration(msg.createdAt - target.createdAt).humanize()} old. Created on ${target.createdAt}`);
	}
};
