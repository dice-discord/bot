import {Argument} from 'discord-akairo';
import {bold} from 'discord-md-tags';
import {Message, Permissions, User} from 'discord.js';
import assert from 'assert';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {typeName as anyUser} from '../../types/anyUser';
import {clean} from '../../util/format';

export default class BanCommand extends DiceCommand {
	constructor() {
		super('unban', {
			aliases: ['unban-member', 'unban-user', 'unhackban-user', 'unhackban-member', 'unhackban'],
			category: DiceCommandCategories.Moderation,
			description: {
				content: 'Unban any user from your server.',
				usage: '<user> [reason}',
				examples: [
					'@Dice',
					'Dice',
					'388191157869477888',
					'@Dice No longer acting stupid',
					'Dice No longer acting stupid',
					'388191157869477888 No longer acting stupid'
				]
			},
			userPermissions: [Permissions.FLAGS.BAN_MEMBERS],
			clientPermissions: [Permissions.FLAGS.BAN_MEMBERS],
			channel: 'guild',
			args: [
				{
					id: 'user',
					type: anyUser,
					prompt: {
						start: 'Who would you like to unban?',
						retry: `Invalid user provided, please try again`
					}
				},
				{
					id: 'reason',
					type: Argument.validate(AkairoArgumentType.String, (message, phrase) => phrase.length <= 400),
					match: 'rest',
					prompt: {
						optional: true,
						retry: `Invalid reason provided, please keep it below 400 characters`
					}
				}
			]
		});
	}

	async exec(message: Message, args: {user: User; reason: string | null}): Promise<Message | undefined> {
		assert(message.guild);

		args.reason = args.reason ? `${args.reason} - Requested by ${message.author.tag}` : `Requested by ${message.author.tag}`;

		const bans = await message.guild.fetchBans();

		if (bans.has(args.user.id)) {
			try {
				await message.guild.members.unban(args.user, args.reason);
			} catch {
				// eslint-disable-next-line no-return-await
				return await message.util?.send('Unable to unban that user');
			}

			return message.util?.send(`${bold`${clean(args.user.tag, message)}`} was unbanned`);
		}

		return message.util?.send("That user isn't banned");
	}
}
