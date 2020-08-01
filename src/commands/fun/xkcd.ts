import {Message, Permissions, MessageEmbed} from 'discord.js';
import {DiceCommand, DiceCommandCategories, AkairoArgumentType} from '../../structures/DiceCommand';
import {Argument} from 'discord-akairo';
import {truncateText} from '../../util/format';
import got from 'got';

interface XKCDComic {
	month: string;
	num: number;
	link: string;
	year: string;
	news: string;
	// eslint-disable-next-line camelcase
	safe_title: string;
	transcript: string;
	alt: string;
	img: string;
	title: string;
	day: string;
}

export default class XKCDCommand extends DiceCommand {
	constructor() {
		super('xkcd', {
			aliases: ['herandom-xkcd", "xkcd-comic", "random-xkcd-comicartbeat'],
			description: {content: 'Get the latest XKCD comic or a specific issue.', examples: ['', '614'], usage: '[issue]'},
			category: DiceCommandCategories.Fun,
			clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
			typing: true,
			args: [
				{
					id: 'issue',
					type: Argument.range(AkairoArgumentType.Integer, 1, 5_000_000),
					match: 'content',
					default: 'latest',
					prompt: {optional: true, retry: 'Invalid issue number, please try again'}
				}
			]
		});
	}

	async exec(message: Message, {issue}: {issue: number | 'latest'}): Promise<Message | undefined> {
		const uri = `https://xkcd.com/${issue === 'latest' ? '' : issue}/info.0.json`;

		let body: XKCDComic;

		try {
			const response = await got<XKCDComic>(uri, {responseType: 'json'});
			body = response.body;
		} catch (error) {
			this.logger.error(error);
			// eslint-disable-next-line no-return-await
			return await message.util?.send('An error occurred while retrieving the comic from XKCD');
		}

		// Result embed
		const embed = new MessageEmbed({
			title: `${body.safe_title} (#${body.num})`,
			author: {
				name: 'XKCD',
				iconURL: 'https://i.imgur.com/AP0vVy5.png',
				url: 'https://xkcd.com'
			}
		});

		// Check if comic exists
		if (body.img) {
			embed.setImage(body.img);
		} else {
			return message.util?.send("Couldn't find that comic");
		}

		// Alt text
		if (body.alt) {
			embed.addField('Alt', truncateText(body.alt, 1024));
		}

		// Transcript
		if (body.transcript) {
			embed.addField('Transcript', truncateText(body.transcript, 1024));
		}

		// Check if there's a link
		embed.setURL(body.link || `https://xkcd.com/${body.num}`);

		// Creation date
		if ([body.day, body.month, body.year].every(value => Boolean(value))) {
			embed.setTimestamp(new Date(Number.parseInt(body.year, 10), Number.parseInt(body.month, 10) - 1, Number.parseInt(body.day, 10)));
		}

		return message.util?.send(embed);
	}
}
