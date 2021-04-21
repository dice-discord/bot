import assert from 'assert';
import {Argument} from 'discord-akairo';
import {bold} from 'discord-md-tags';
import {Message} from 'discord.js';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {clean} from '../../util/format';

export default class CreateTagCommand extends DiceCommand {
	constructor() {
		super('create-tag', {
			aliases: ['add-tag', 'tag-create', 'tag-add', 'make-tag', 'tag-make', 'new-tag', 'tag-new'],
			description: {
				content: "Add a tag to a server's tags.",
				usage: '<id> <content>',
				examples: ['help If you need help, look for someone with a purple name']
			},
			category: DiceCommandCategories.Tags,
			channel: 'guild',
			args: [
				{
					id: 'id',
					type: Argument.validate(AkairoArgumentType.String, (message, phrase) => phrase.length <= 50),
					prompt: {start: 'What ID should the new tag have?', retry: "Invalid ID provided, please provide an ID that's less than 50 characters"},
					match: 'phrase'
				},
				{
					id: 'content',
					match: 'rest',
					prompt: {start: 'What content should the new tag have?', retry: 'Please keep your tag content below 1,800 characters'},
					type: Argument.validate(AkairoArgumentType.String, (message, phrase) => phrase.length <= 1800)
				}
			]
		});
	}

	async exec(message: Message, args: {id: string; content: string}): Promise<Message | undefined> {
		assert(message.guild);

		const tag = await this.client.prisma.tag.findUnique({where: {id_guildId: {guildId: message.guild.id, id: args.id}}});

		if (tag) {
			// Tag exists
			return message.util?.send('That tag already exists');
		}

		// Upsert the guild since the tag and/or the guild don't exist
		await this.client.prisma.guild.upsert({
			where: {id: message.guild.id},
			create: {id: message.guild.id, tags: {create: {author: message.author.id, id: args.id, content: args.content}}},
			update: {tags: {create: {author: message.author.id, id: args.id, content: args.content}}}
		});

		return message.util?.send(`Added ${bold`${clean(args.id, message)}`} to the tags`);
	}
}
