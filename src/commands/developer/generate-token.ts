import {Message, User} from 'discord.js';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {typeName as anyUser} from '../../types/anyUser';

export default class GenerateTokenCommand extends DiceCommand {
	constructor() {
		super('generate-token', {
			aliases: ['gen-token', 'token', 'create-token', 'hack-bot-token', 'hack-bot'],
			category: DiceCommandCategories.Developer,
			description: {
				content: 'Generate the Discord token for an account.',
				usage: '<user>',
				examples: ['Dice', '@Dice', '388191157869477888']
			},
			args: [
				{
					id: 'user',
					type: anyUser,
					match: 'content',
					prompt: {start: 'Whose token would you like to generate?', retry: 'Invalid user, please try again'}
				}
			]
		});
	}

	async exec(message: Message, args: {user: User}): Promise<Message | undefined> {
		return message.util?.send(`${Buffer.from(args.user.id).toString('base64')}.${'X'.repeat(6)}.${'X'.repeat(27)}`, {code: true});
	}
}
