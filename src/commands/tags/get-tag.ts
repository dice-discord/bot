import {Argument} from 'discord-akairo';
import {Message} from 'discord.js';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {clean} from '../../util/format';

export interface GetTagCommandArgs {
	id?: string;
	noError?: boolean;
}

export default class GetTagCommand extends DiceCommand {
	constructor() {
		super('get-tag', {
			aliases: ['read-tag', 'tag-get', 'tag'],
			description: {
				content: "Get a tag from a server's tags.",
				usage: '<id>',
				examples: ['help']
			},
			category: DiceCommandCategories.Tags,
			channel: 'guild',
			args: [
				{
					id: 'id',
					type: Argument.validate(AkairoArgumentType.String, (message, phrase) => phrase.length <= 50),
					prompt: {start: 'What is the ID of the tag you want to get?', retry: "Invalid ID provided, please provide an ID that's less than 50 characters"},
					match: 'content'
				}
			]
		});
	}

	// `noError` is intentionally not listed in the args array in the constructor
	async exec(message: Message, args: GetTagCommandArgs): Promise<Message | undefined> {
		if (args.id === undefined) {
			return;
		}

		const tag = await this.client.prisma.tag.findOne({where: {id_guildId: {guildId: message.guild!.id, id: args.id}}, select: {content: true}});

		if (tag) {
			return message.util?.send(clean(tag.content, message));
		}

		// This is defined when the command is triggered by a `messageInvalid` event
		// ex. `$$tag-name` would provide the args {id: 'tag-name', noError: true}
		if (!args.noError) {
			return message.util?.send("That tag doesn't exist");
		}
	}
}
