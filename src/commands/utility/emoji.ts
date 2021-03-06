import {GuildEmoji, Message} from 'discord.js';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {clean} from '../../util/format';
import {bold, code} from 'discord-md-tags';

export default class EmojiCommand extends DiceCommand {
	constructor() {
		super('emoji', {
			aliases: ['custom-emoji'],
			description: {content: 'View info about a custom emoji.', usage: '<emoji>', examples: ['thonk']},
			category: DiceCommandCategories.Util,
			channel: 'guild',
			args: [
				{
					id: 'emoji',
					type: AkairoArgumentType.Emoji,
					match: 'content',
					prompt: {start: 'Which custom emoji do you want to view?', retry: 'Invalid custom emoji provided, please try again'}
				}
			]
		});
	}

	async exec(message: Message, {emoji}: {emoji: GuildEmoji}): Promise<Message | undefined> {
		return message.util?.send([`${bold`:${clean(emoji.name, message)}:`} - ${code`${emoji.id}`}`, emoji.url].join('\n'));
	}
}
