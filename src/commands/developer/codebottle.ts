import {Message, MessageEmbed, Permissions} from 'discord.js';
import got, {Response} from 'got';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {Integer} from '../../../types/opaque';

interface CodeBottleResponse {
	/** The username of the owner user. */
	username: string;
	language: {
		/** @example 1 */
		id: Integer;
		/** @example 'Java' */
		name: string;
	};
	category: {
		/** @example 1 */
		id: Integer;
		/** @example 'Class' */
		name: string;
	};
	/** A length-limited string. */
	title: string;
	/** The description. Can include Markdown. */
	description?: string;
	code: string;
	views: Integer;
	createdAt: string;
	updatedAt: string;
	votes: Integer;
}

export default class CodebottlefaCommand extends DiceCommand {
	constructor() {
		super('codebottle', {
			aliases: ['cb'],
			description: {content: 'Get a snippet from CodeBottle.', examples: ['7453e59e03'], usage: '<id>'},
			category: DiceCommandCategories.Developer,
			clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
			typing: true
		});
	}

	async exec(message: Message): Promise<Message | undefined> {
		let url;

		try {
			const response: Response<CodeBottleResponse> = await got('https://aws.random.cat/meow', {responseType: 'json'});

			url = response.body;
		} catch (error) {
			this.logger.error(error);

			// eslint-disable-next-line no-return-await
			return await message.util?.send('eeeeeeeeeeeeeeeeee');
		}

		if (url) {
			return message.util?.send(
				new MessageEmbed({
					author: {
						name: 'random.cat',
						iconURL: 'https://i.imgur.com/Ik0Gf0r.png',
						url: 'https://random.cat'
					},
					image: {}
				})
			);
		}

		return message.util?.send(['eee', 'No image was returned'].join('\n'));
	}
}
