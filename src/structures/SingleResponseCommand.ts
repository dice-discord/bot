import {Message, MessageEmbed, Permissions} from 'discord.js';
import {DiceCommand, DiceCommandCategories, DiceCommandOptions} from './DiceCommand';

type Response = string | MessageEmbed;

interface SingleResponseCommandsOptions extends Pick<DiceCommandOptions, 'aliases'> {
	description: string;
	response: Response;
}

export default class SingleResponseCommand extends DiceCommand {
	response: Response;
	constructor(id: string, options: SingleResponseCommandsOptions) {
		super(id, {
			aliases: options.aliases,
			category: DiceCommandCategories.Single,
			description: {content: options.description},
			clientPermissions: options.response instanceof MessageEmbed ? [Permissions.FLAGS.EMBED_LINKS] : undefined
		});

		this.response = options.response;
	}

	async exec(message: Message): Promise<Message | undefined> {
		return message.util?.send(this.response);
	}
}
