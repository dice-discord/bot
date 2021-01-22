import {Argument} from 'discord-akairo';
import {bold} from 'discord-md-tags';
import {Message, Permissions, User} from 'discord.js';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {typeName as anyUser} from '../../types/anyUser';
import {clean} from '../../util/format';
import {notManageable} from '../../util/permissions';

export default class BanCommand extends DiceCommand {
	constructor() {
		super('ban', {
			aliases: ['ban-member', 'ban-user', 'hackban-user', 'hackban-member', 'hackban'],
			category: DiceCommandCategories.Moderation,
			description: {
				content: 'Ban any user from your server or prevent them from ever joining.',
				usage: '<user> [reason]',
				examples: ['@Dice', 'Dice', '388191157869477888', '@Dice Spamming', 'Dice Spamming', '388191157869477888 Spamming']
			},
			userPermissions: [Permissions.FLAGS.BAN_MEMBERS],
			clientPermissions: [Permissions.FLAGS.BAN_MEMBERS],
			channel: 'guild',
			args: [
				{
					id: 'user',
					type: anyUser,
					prompt: {
						start: 'Who would you like to ban?',
						retry: 'Invalid user provided, please try again'
					}
				},
				{
					id: 'reason',
					type: Argument.validate(AkairoArgumentType.String, (message, phrase) => phrase.length <= 400),
					match: 'rest',
					prompt: {
						optional: true,
						retry: 'Invalid reason provided, please keep it below 400 characters'
					}
				}
			]
		});
	}

	async exec(message: Message, args: {user: User; reason: string | null}): Promise<Message | undefined> {
		if (args.reason) {
			args.reason = `${args.reason} - Requested by ${message.author.tag}`;
		} else {
			args.reason = `Requested by ${message.author.tag}`;
		}

		const bans = await message.guild!.fetchBans();

		if (bans.has(args.user.id)) {
			return message.util?.send('That user is already banned');
		}

		const guildMember = message.guild!.members.resolve(args.user);

		if (guildMember) {
			if (!guildMember.bannable) {
				// User is on this server and is not bannable
				return message.util?.send("I can't ban that member");
			}

			// Taken from discord.js `GuildMember.manageable https://github.com/discordjs/discord.js/blob/4ec01ddef56272f6bed23dd0eced8ea9851127b7/src/structures/GuildMember.js#L216-L222`
			if (notManageable(message.member!, guildMember)) {
				return message.util?.send("You don't have permissions to ban that member");
			}
		}

		try {
			await message.guild!.members.ban(args.user, {reason: args.reason});
		} catch {
			// eslint-disable-next-line no-return-await
			return await message.util?.send('Unable to ban that user');
		}

		return message.util?.send(`${bold`${clean(args.user.tag, message)}`} was banned`);
	}
}
