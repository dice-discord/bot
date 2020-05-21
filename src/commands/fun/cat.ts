import {Message, MessageEmbed, Permissions} from 'discord.js';
import got, {Response} from 'got';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';

const genericErrorMessage = 'There was an error with the service we use (https://random.cat/)';

interface RandomCatResponse {
	file: string;
}

export default class CatCommand extends DiceCommand {
	constructor() {
		super('cat', {
			aliases: ['random-cat-image', 'random-cat', 'cat-image'],
			description: {content: 'Get a picture of a random cat.', examples: [''], usage: ''},
			category: DiceCommandCategories.Fun,
			clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
			typing: true
		});
	}

	async exec(message: Message): Promise<Message | undefined> {
		let url;

		try {
			const response: Response<RandomCatResponse> = await got('https://aws.random.cat/meow', {responseType: 'json'});

			url = response.body.file;
		} catch (error) {
			this.logger.error(error);

			// eslint-disable-next-line no-return-await
			return await message.util?.send(genericErrorMessage);
		}

		if (url) {
			return message.util?.send(
				new MessageEmbed({
					author: {
						name: 'random.cat',
						iconURL: 'https://i.imgur.com/Ik0Gf0r.png',
						url: 'https://random.cat'
					},
					image: {url}
				})
			);
		}

		return message.util?.send([genericErrorMessage, 'No image was returned'].join('\n'));
	}
}
