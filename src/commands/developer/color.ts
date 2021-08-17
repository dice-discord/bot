import {Argument} from 'discord-akairo';
import {Message, MessageEmbed, Permissions, Util} from 'discord.js';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import parseColor from 'parse-color';

export default class ColorCommand extends DiceCommand {
	constructor() {
		super('color', {
			aliases: ['rgb', 'cmyk', 'hsv', 'hsl', 'hex', 'hexadecimal', 'colors'],
			category: DiceCommandCategories.Developer,
			description: {
				content: 'Display and convert a color.',
				usage: '<color>',
				examples: ['blue', '#4caf50', 'hsl(210,50,50)']
			},
			clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
			args: [
				{
					id: 'color',
					type: Argument.validate(AkairoArgumentType.String, (message, phrase) => {
						if (!phrase.startsWith('#') && phrase.length === 6) {
							// Hexadecimal missing the pound sign
							const testResult = parseColor(`#${phrase}`);
							if (!testResult.cmyk || !testResult.rgb || !testResult.hsv || !testResult.hsl || !testResult.hex) {
								// Invalid hexadecimal
								return false;
							}
						} else {
							// Other color type
							const parsedColor = parseColor(phrase);
							if (!parsedColor.cmyk || !parsedColor.rgb || !parsedColor.hsv || !parsedColor.hsl || !parsedColor.hex) {
								return false;
							}
						}

						return true;
					}),
					match: 'content',
					prompt: {start: 'What color do you want to get information on?', retry: 'Invalid color provided, please try again'}
				}
			]
		});
	}

	async exec(message: Message, args: {color: string}): Promise<Message | undefined> {
		let parsedColor: parseColor.Color;

		if (!args.color.startsWith('#') && args.color.length === 6) {
			// Hexadecimal missing the pound sign
			const testResult = parseColor(`#${args.color}`);

			// Valid hexadecimal, missing pound sign `#`
			parsedColor = testResult;
		} else {
			// Other color type
			parsedColor = parseColor(args.color);
		}

		return message.util?.send(
			new MessageEmbed({
				color: Util.resolveColor(parsedColor.rgb),
				thumbnail: {
					url: `http://www.thecolorapi.com/id?format=svg&named=false&hex=${parsedColor.hex.slice(1)}`
				},
				fields: [
					{
						name: 'CSS Keyword',
						value: parsedColor.keyword ?? 'None'
					},
					{
						name: 'Hexadecimal',
						value: parsedColor.hex.toString()
					},
					{
						name: 'CMYK',
						value: parsedColor.cmyk.join(', ')
					},
					{
						name: 'HSL',
						value: parsedColor.hsl.join(', ')
					},
					{
						name: 'HSV',
						value: parsedColor.hsv.join(', ')
					},
					{
						name: 'RGB',
						value: parsedColor.rgb.join(', ')
					}
				]
			})
		);
	}
}
