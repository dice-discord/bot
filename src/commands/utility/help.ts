import {capitalize} from '@pizzafox/util';
import {PrefixSupplier} from 'discord-akairo';
import {code, codeblock} from 'discord-md-tags';
import {Message, MessageEmbed, Permissions} from 'discord.js';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';

export default class HelpCommand extends DiceCommand {
	constructor() {
		super('help', {
			category: DiceCommandCategories.Util,
			description: {
				content: 'Displays a list of available commands, or detailed information for a specified command.',
				usage: '[command]',
				examples: ['', 'ping']
			},
			clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
			args: [
				{
					id: 'command',
					type: AkairoArgumentType.CommandAlias,
					prompt: {optional: true, retry: 'Invalid command provided, please try again'}
				}
			]
		});
	}

	async exec(message: Message, {command}: {command?: DiceCommand}): Promise<Message | undefined> {
		const embed = new MessageEmbed();

		if (command) {
			const [primaryCommandAlias] = command.aliases;

			embed
				.setTitle(primaryCommandAlias)
				.addField('Description', command.description.content)
				.addField('Usage', code`${primaryCommandAlias}${command.description.usage ? ` ${command.description.usage}` : ''}`);

			if (command.aliases.length > 1) {
				embed.addField('Aliases', command.aliases.map(alias => code`${alias}`).join(', '));
			}

			if (command.description.examples?.length) {
				embed.addField(
					'Examples',
					codeblock`${command.description.examples.map(example => `${primaryCommandAlias}${example ? ` ${example}` : ''}`).join('\n')}`
				);
			}

			return message.util?.send(embed);
		}

		const prefix = (this.handler.prefix as PrefixSupplier)(message);
		embed.setTitle('Commands');
		embed.setDescription(`For additional help for a command use ${code`${await prefix}help <command>`}`);

		const authorIsOwner = this.client.isOwner(message.author);

		for (const [id, category] of this.handler.categories) {
			// Only show categories if any of the following are true
			// 	1. The message author is an owner
			// 	2. Some commands are not owner-only
			if (authorIsOwner || category.some(cmd => !cmd.ownerOnly)) {
				embed.addField(
					capitalize(id),
					category
						// Remove owner-only commands if you are not an owner
						.filter(cmd => (authorIsOwner ? true : !cmd.ownerOnly))
						.map(cmd => `\`${cmd.aliases[0]}\``)
						.join(', ')
				);
			}
		}

		return message.util?.send(embed);
	}
}
