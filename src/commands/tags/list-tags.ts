import {code} from 'discord-md-tags';
import {Message, Util} from 'discord.js';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';

export default class ListTagsCommand extends DiceCommand {
	constructor() {
		super('list-tags', {
			aliases: ['tags-list', 'all-tags', 'tags-all', 'tags-ls', 'ls-tags'],
			description: {content: 'List all tags from this server.'},
			category: DiceCommandCategories.Tags,
			channel: 'guild'
		});
	}

	async exec(message: Message): Promise<Message | undefined> {
		const guild = await this.client.prisma.guild.findOne({where: {id: message.guild!.id}, select: {tags: true}});

		if (guild && guild.tags.length > 0) {
			return message.util?.send(guild.tags.map(tag => code`${Util.escapeMarkdown(Util.cleanContent(tag.id, message), {inlineCodeContent: true})}`).join(', '));
		}

		return message.util?.send('No tags');
	}
}
