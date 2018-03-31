// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const { stripIndents } = require('common-tags');
const replaceAll = require('replaceall');

module.exports = class GenerateCommandDocumentationCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'generate-command-documentation',
			group: 'dev',
			memberName: 'generate-command-documentation',
			description: 'Creates a Markdown documentation page for a command.',
			details: 'Only the bot owner(s) may use this command.',
			aliases: [
				'command-documentation',
				'make-command-documentation',
				'generate-command-docs',
				'command-docs',
				'make-command-docs',
				'generate-command-doc',
				'gen-command-doc',
				'gen-command-documentation',
				'gen-command-docs',
				'command-doc',
				'make-command-doc',
				'cmd-documentation',
				'make-cmd-documentation',
				'generate-cmd-docs',
				'cmd-docs',
				'make-cmd-docs',
				'generate-cmd-doc',
				'gen-cmd-doc',
				'gen-cmd-documentation',
				'gen-cmd-docs',
				'cmd-doc',
				'make-cmd-doc'
			],
			throttling: {
				usages: 2,
				duration: 15
			},
			args: [{
				key: 'command',
				prompt: 'What command do you want to generate documentation for?',
				type: 'command'
			}],
			ownerOnly: true
		});
	}

	run(msg, { command }) {
		const capitalizeString = string => `${string.charAt(0).toUpperCase()}${string.slice(1)}`;

		let result = stripIndents`
		title: ${capitalizeString(replaceAll('-', ' ', command.name))}
		description: ${command.description}
		path: tree/master/commands/${command.group.id}
		source: ${command.name}.js
		
		# ${capitalizeString(replaceAll('-', ' ', command.name))}
		
		## Description
		
		${command.description}`;

		if(command.details) {
			result = stripIndents`
			${result}

			## Details
			
			${command.details}`;
		}

		if(command.aliases && command.aliases.length > 0) {
			const aliases = [];
			command.aliases.forEach(alias => aliases.push(`* \\\`${alias}\\\``));

			result = stripIndents`
			${result}

			## Aliases
			
			${aliases.join('\n')}`;
		}

		result = stripIndents`
		${result}
		
		## Usage
		
		### Format
		
		\\\`${command.name}${command.format ? ` ${command.format}` : ''}\\\``;

		if(command.examples && command.examples.length > 0) {
			const examples = [];
			command.examples.forEach(example => examples.push(`* \\\`${example}\\\``));

			result = stripIndents`
			${result}

			### Examples
			
			${examples.join('\n')}`;
		}

		if(command.argsCollector.args && command.argsCollector.args.length > 0) {
			const args = [];
			// eslint-disable-next-line max-len
			command.argsCollector.args.forEach(arg => args.push(`| ${arg.label ? capitalizeString(arg.label) : capitalizeString(arg.key)} | ${capitalizeString(arg.type.id)} |${typeof arg.default !== 'undefined' ? 'No' : 'Yes'} | ${arg.min ? arg.min : ''} | ${arg.max ? arg.max : ''} |`));

			result = stripIndents`
			${result}

			### Arguments
			
			| Name  | Type | Required | Minimum | Maximum |
			|-------|------|----------|---------|---------|
			${args.join('\n')}`;
		}

		return msg.say(result, { split: true });
	}
};
