import {Argument} from 'discord-akairo';
import {bold} from 'discord-md-tags';
import {Message, Permissions} from 'discord.js';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {clean} from '../../util/format';

export default class DeleteTagCommand extends DiceCommand {
	constructor() {
		super('delete-tag', {
			aliases: ['tag-delete', 'tags-delete', 'delete-tags', 'del-tags', 'tag-del', 'tags-del', 'del-tag', 'rm-tag', 'rm-tags', 'tags-rm', 'tag-rm'],
			description: {content: 'Remove a role from this server’s selfroles.', usage: '<id>', examples: ['help']},
			category: DiceCommandCategories.Tags,
			channel: 'guild',
			args: [
				{
					id: 'id',
					type: Argument.validate(AkairoArgumentType.String, (message, phrase) => phrase.length <= 50),
					prompt: {retry: 'Invalid tag provided, please try again', start: 'Which tag do you like to delete?'}
				}
			]
		});
	}

	async exec(message: Message, args: {id: string}): Promise<Message | undefined> {
		const tag = await this.client.prisma.tag.findOne({where: {id_guildId: {guildId: message.guild!.id, id: args.id}}});

		if (tag) {
			if (tag.author === message.author.id || message.member!.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
				// You created this tag or you have manage messages permissions
				await this.client.prisma.tag.delete({where: {id_guildId: {guildId: message.guild!.id, id: args.id}}, select: {id: true}});
				return message.util?.send(`Deleted ${bold`${clean(args.id, message)}`} from this server’s tags`);
			}

			return message.util?.send(
				[
					'You don’t have permission to delete that tag',
					`Only its author (${clean((await this.client.users.fetch(tag.author)).tag, message)}) or someone with manage messages permissions can delete it`
				].join('\n')
			);
		}

		return message.util?.send('That tag doesn’t exist');
	}
}
