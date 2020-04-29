import {Message, User} from 'discord.js';
import {ArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';

export default class BlacklistCommand extends DiceCommand {
	constructor() {
		super('blacklist', {
			aliases: ['blacklist-user', 'unblacklist', 'unblacklist-user'],
			category: DiceCommandCategories.Util,
			description: {
				content: 'Blacklist a user or see why they were blacklisted.',
				usage: '<user> <reason>',
				examples: ['@Dice', '@Dice abusing a bug', '@Dice remove']
			},
			ownerOnly: true,
			args: [
				{
					id: 'user',
					match: 'phrase',
					type: ArgumentType.User,
					prompt: {start: 'Who do you want to blacklist?', retry: 'Invalid user, please try again'}
				},
				{
					id: 'reason',
					match: 'rest',
					type: ArgumentType.String,
					prompt: {optional: true, start: 'Why do you want to blacklist them?'}
				}
			]
		});
	}

	async exec(message: Message, args: {user: User; reason?: 'remove' | string}): Promise<Message | undefined> {
		const user = await this.client.prisma.user.findOne({where: {id: args.user.id}, select: {blacklistReason: true}});

		if (typeof user?.blacklistReason === 'string') {
			// User is blacklisted
			if (args.reason === 'remove') {
				// Remove the user from the blacklist
				await this.client.prisma.user.update({where: {id: args.user.id}, data: {blacklistReason: null}});
				return message.util?.send(`${args.user.tag} was removed from the blacklist`);
			}

			return message.util?.send(
				[`${args.user.tag} is ${typeof args.reason === 'string' ? 'already ' : ''}blacklisted for`, `> ${user.blacklistReason}`].join('\n')
			);
		}

		// User does not exist or is not blacklisted
		if (typeof args.reason === 'string') {
			await this.client.prisma.user.upsert({
				where: {id: args.user.id},
				create: {id: args.user.id, blacklistReason: args.reason},
				update: {blacklistReason: args.reason}
			});
			return message.util?.send(`Blacklisted ${args.user.tag}`);
		}

		return message.util?.send(`${args.user.tag} is not blacklisted`);
	}
}
