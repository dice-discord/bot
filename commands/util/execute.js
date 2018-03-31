const util = require('util');
const discord = require('discord.js');
const tags = require('common-tags');
const escapeRegex = require('escape-string-regexp');
var { exec } = require('child-process-promise');
const { Command } = require('discord.js-commando');

const nl = '!!NL!!';
const nlPattern = new RegExp(nl, 'g');

module.exports = class ExecuteCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'execute',
			group: 'util',
			memberName: 'execute',
			description: 'Executes a command in the console.',
			details: 'Only the bot owner(s) may use this command.',
			ownerOnly: true,
			aliases: ['exec'],
			args: [{
				key: 'command',
				prompt: 'What command would you like to execute?',
				type: 'string'
			}]
		});

		this.lastResult = null;
	}

	async run(msg, { command }) {
		// Execute the command and measure its execution time
		let hrDiff;
		try {
			const hrStart = process.hrtime();
			this.lastResult = (await exec(command)).stdout;
			hrDiff = process.hrtime(hrStart);
		} catch(err) {
			return msg.reply(`Error while executing: \`${err}\``);
		}

		// Prepare for callback time and respond
		this.hrStart = process.hrtime();
		let response = this.makeResultMessages(this.lastResult, hrDiff, command, msg.editable);
		if(msg.editable) {
			if(response instanceof Array) {
				if(response.length > 0) response = response.slice(1, response.length - 1);
				for(const re of response) msg.say(re);
				return null;
			} else {
				return msg.edit(response);
			}
		} else {
			return msg.reply(response);
		}
	}

	makeResultMessages(result, hrDiff, input = null, editable = false) {
		const inspected = util.inspect(result, { depth: 0 })
			.replace(nlPattern, '\n')
			.replace(this.sensitivePattern, '--snip--');
		const split = inspected.split('\n');
		const last = inspected.length - 1;
		const prependPart = inspected[0] !== '{' && inspected[0] !== '[' && inspected[0] !== "'" ? split[0] : inspected[0];
		const appendPart = inspected[last] !== '}' && inspected[last] !== ']' && inspected[last] !== "'" ?
			split[split.length - 1] :
			inspected[last];
		const prepend = `\`\`\`\n${prependPart}\n`;
		const append = `\n${appendPart}\n\`\`\``;
		if(input) {
			return discord.splitMessage(tags.stripIndents`
				${editable ? `
					*Input*
					\`\`\`
					${input}
					\`\`\`` :
				''}
				*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*
				\`\`\`
				${inspected}
				\`\`\`
			`, 1900, '\n', prepend, append);
		} else {
			return discord.splitMessage(tags.stripIndents`
				*Callback executed after ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*
				\`\`\`
				${inspected}
				\`\`\`
			`, 1900, '\n', prepend, append);
		}
	}

	get sensitivePattern() {
		if(!this._sensitivePattern) {
			const client = this.client;
			let pattern = '';
			if(client.token) pattern += escapeRegex(client.token);
			Object.defineProperty(this, '_sensitivePattern', { value: new RegExp(pattern, 'gi') });
		}
		return this._sensitivePattern;
	}
};
