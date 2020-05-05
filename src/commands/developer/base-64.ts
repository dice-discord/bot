import {Message} from 'discord.js';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';

export default class Base64Command extends DiceCommand {
	constructor() {
		super('base-64', {
			aliases: ['base-64-encode', 'base-64-decode'],
			category: DiceCommandCategories.Developer,
			description: {
				content: 'Encode or decode a string with Base64 encoding',
				usage: '--mode <mode> <content>',
				examples: ['--mode encode hello', '--mode decode aGVsbG8=']
			},
			args: [
				{
					id: 'content',
					type: AkairoArgumentType.String,
					match: 'rest',
					prompt: {start: 'What text would you like to decode or encode?'}
				},
				{
					id: 'mode',
					match: 'option',
					type: [
						['encode', 'to'],
						['decode', 'from']
					],
					default: 'encode',
					flag: '--mode',
					prompt: {start: 'Do you want to convert from Base64 or to Base64?', retry: 'Invalid mode, please try again'}
				}
			]
		});
	}

	async exec(message: Message, args: {content: string; mode: 'encode' | 'decode'}): Promise<Message | undefined> {
		const content = Buffer.from(args.content, args.mode === 'decode' ? 'base64' : 'utf-8');

		return message.util?.send(content.toString(args.mode === 'encode' ? 'base64' : 'utf-8'), {code: true});
	}
}
