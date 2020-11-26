import {Argument} from 'discord-akairo';
import {bold} from 'discord-md-tags';
import {Message, Permissions} from 'discord.js';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {clean} from '../../util/format';

export default class EditTagCommand extends DiceCommand {
	constructor() {
		super('edit-tag', {
			aliases: [
				'edit-tags',
				'modify-tag',
				'modify-tags',
				'tag-edit',
				'tags-edit',
				'tag-change',
				'change-tag',
				'tags-change',
				'change-tags',
				'update-tags',
				'update-tag',
				'tag-update',
				'tags-update'
			],
			description: {content: "Edit an existing tag from a server's tags.", usage: '<id> <content>', examples: ['help New content']},
			category: DiceCommandCategories.Tags,
			channel: 'guild',
			args: [
				{
					id: 'id',
					type: Argument.validate(AkairoArgumentType.String, (message, phrase) => phrase.length <= 50),
					prompt: {start: 'Which tag do you want to edit?', retry: "Invalid ID provided, please provide an ID that's less than 50 characters"},
					match: 'phrase'
				},
				{
					id: 'content',
					match: 'rest',
					prompt: {start: 'What content should the updated tag have?', retry: 'Please keep your tag content below 1,800 characters'},
					type: Argument.validate(AkairoArgumentType.String, (message, phrase) => phrase.length <= 1800)
				}
			]
		});
	}

	async exec(message: Message, args: {id: string; content: string}): Promise<Message | undefined> {
		const tag = await this.client.prisma.tag.findUnique({where: {id_guildId: {guildId: message.guild!.id, id: args.id}}, select: {author: true}});

		if (tag) {
			if (tag.author === message.author.id || message.member!.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
				// You created this tag or you have manage messages permissions

				const updatedTag = await this.client.prisma.tag.update({
					where: {id_guildId: {guildId: message.guild!.id, id: args.id}},
					data: {content: args.content},
					select: {id: true}
				});
				return message.util?.send(`Edited tag ${bold`${clean(updatedTag.id, message)}`}`);
			}

			return message.util?.send(
				[
					"You don't have permission to edit that tag",
					`Only its author (${clean((await this.client.users.fetch(tag.author)).tag, message)}) or someone with manage messages permissions can edit it`
				].join('\n')
			);
		}

		return message.util?.send("That tag doesn't exist");
	}
}
