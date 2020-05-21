import {Message, MessageEmbed, Permissions} from 'discord.js';
import got, {Response} from 'got';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';

const genericErrorMessage = 'There was an error with the service we use (https://dog.ceo/)';

interface DogCEOResponse {
	message: string;
	status: 'success' | string;
}

export default class DogCommand extends DiceCommand {
	constructor() {
		super('dog', {
			aliases: ['random-dog-image', 'random-dog', 'dog-image'],
			description: {content: 'Get a picture of a random dog.', examples: [''], usage: ''},
			category: DiceCommandCategories.Fun,
			clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
			typing: true
		});
	}

	async exec(message: Message): Promise<Message | undefined> {
		let url;

		try {
			const response: Response<DogCEOResponse> = await got('https://dog.ceo/api/breeds/image/random', {responseType: 'json'});

			url = response.body.message;
		} catch (error) {
			this.logger.error(error);

			// eslint-disable-next-line no-return-await
			return await message.util?.send(genericErrorMessage);
		}

		if (url) {
			return message.util?.send(
				new MessageEmbed({
					author: {
						name: 'dog.ceo',
						iconURL: 'https://dog.ceo/img/favicon.png',
						url: 'https://dog.ceo/dog-api/'
					},
					image: {url}
				})
			);
		}

		return message.util?.send([genericErrorMessage, 'No image was returned'].join('\n'));
	}
}
