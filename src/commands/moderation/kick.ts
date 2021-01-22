import {Argument} from 'discord-akairo';
import {bold} from 'discord-md-tags';
import {GuildMember, Message, Permissions} from 'discord.js';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {clean} from '../../util/format';
import {notManageable} from '../../util/permissions';

export default class KickCommand extends DiceCommand {
	constructor() {
		super('kick', {
			aliases: ['kick-member', 'kick-user'],
			category: DiceCommandCategories.Moderation,
			description: {
				content: 'Kick a member from your server.',
				usage: '<member> [reason]',
				examples: ['@Dice', 'Dice', '388191157869477888', '@Dice Spamming', 'Dice Spamming', '388191157869477888 Spamming']
			},
			userPermissions: [Permissions.FLAGS.KICK_MEMBERS],
			clientPermissions: [Permissions.FLAGS.KICK_MEMBERS],
			channel: 'guild',
			args: [
				{
					id: 'member',
					type: AkairoArgumentType.Member,
					prompt: {
						start: 'Who would you like to kick?',
						retry: `Invalid member provided, please try again`
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

	async exec(message: Message, args: {member: GuildMember; reason: string | null}): Promise<Message | undefined> {
		if (args.reason) {
			args.reason = `${args.reason} - Requested by ${message.author.tag}`;
		} else {
			args.reason = `Requested by ${message.author.tag}`;
		}

		if (!notManageable(message.member!, args.member)) {
			return message.util?.send("You don't have permissions to kick that member");
		}

		if (args.member.kickable) {
			try {
				await args.member.kick(args.reason);
			} catch {
				// eslint-disable-next-line no-return-await
				return await message.util?.send('Unable to kick that member');
			}

			return message.util?.send(`${bold`${clean(args.member.user.tag, message)}`} was kicked`);
		}

		// Member not kickable
		return message.util?.send("I can't kick that member");
	}
}
