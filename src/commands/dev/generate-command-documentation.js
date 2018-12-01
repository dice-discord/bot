/*
Copyright 2018 Jonah Snider

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const { Command } = require('discord.js-commando');
const { stripIndents } = require('common-tags');

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
    const prettyTitle = capitalizeString(command.name.replace(/[-]/, ' '));

    let result = stripIndents`
		title: ${prettyTitle}
		description: ${command.description}
		path: tree/master/src/commands/${command.group.id}
		source: ${command.name}.js
		
		# ${prettyTitle}
		
		## Description
		
		${command.description}`;

    if (command.details) {
      result = stripIndents`
			${result}

			## Details
			
			${command.details}`;
    }

    if (command.aliases && command.aliases.length > 0) {
      const aliases = [];
      command.aliases.forEach(alias => aliases.push(`- \\\`${alias}\\\``));

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

    if (command.examples && command.examples.length > 0) {
      const examples = command.examples.map(example => `- \\\`${example}\\\``);

      result = stripIndents`
			${result}

			### Examples
			
			${examples.join('\n')}`;
    }

    if (command.argsCollector && command.argsCollector.args && command.argsCollector.args.length > 0) {
      const args = command.argsCollector.args.map(arg => {
        const name = arg.label ? capitalizeString(arg.label) : capitalizeString(arg.key);
        const type = capitalizeString(arg.type.id);
        const required = arg.default ? 'Yes' : 'No';
        const minimum = arg.min || '';
        const maximum = arg.max || '';

        return `| ${name} | ${type} | ${required} | ${minimum} | ${maximum} |`;
      });

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
