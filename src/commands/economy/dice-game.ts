import {Argument} from 'discord-akairo';
import {bold} from 'discord-md-tags';
import {Message, MessageEmbed, Permissions} from 'discord.js';
import {Colors} from '../../constants';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {DiceUser} from '../../structures/DiceUser';
import {simpleFormat} from '../../util/format';

/** The minimum a user must wager. */
export const minimumWager = 1;

/** The house edge. */
export const houseEdgePercentage = 0.01;

/** Values used for restricting the range of values for a multiplier. */
export const multipliers = {
	min: 1.01,
	max: 100
};

/**
 * Calculate the win percentage for a specific multiplier.
 * @param multiplier The multiplier to calculate the win percentage for
 * @returns The likelihood that that multiplier would have succeeded, ranging from [0, 1]
 */
export function winPercentage(multiplier: number): number {
	return simpleFormat((1 - houseEdgePercentage) / multiplier, 4);
}

export default class DiceGameCommand extends DiceCommand {
	constructor() {
		super('dice-game', {
			aliases: ['game', 'play-game', 'play-dice', 'betting-game', 'bet'],
			category: DiceCommandCategories.Economy,
			description: {
				content: 'Try making a profit by multiplying some wagered oats. Higher multipliers give better rewards, but are riskier.',
				usage: '',
				examples: ['250 4']
			},
			clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
			args: [
				{
					id: 'wager',
					type: Argument.range(AkairoArgumentType.Integer, minimumWager, Infinity),
					match: 'phrase',
					prompt: {start: 'How many oats do you want to wager?', retry: `Please provide a value greater than ${minimumWager.toLocaleString()}`}
				},
				{
					id: 'multiplier',
					type: Argument.range(AkairoArgumentType.Number, 1.01, 100, true),
					prompt: {
						start: 'How much do you want to multiply your wager by?',
						retry: `Please provide a value between ${multipliers.min.toLocaleString()} and ${multipliers.max.toLocaleString()}`
					}
				}
			],
			typing: true
		});
	}

	async exec(message: Message, args: {wager: number; multiplier: number}): Promise<Message | undefined> {
		args.wager = simpleFormat(args.wager);
		args.multiplier = simpleFormat(args.multiplier);

		const author = new DiceUser(message.author);
		const dice = new DiceUser(this.client.user!);
		let authorBalance = await author.getBalance();
		const diceBalance = await dice.getBalance();

		if (authorBalance < args.wager) {
			return message.util?.send(
				[`You are missing ${(args.wager - authorBalance).toLocaleString()} oats`, `Your balance is ${authorBalance.toLocaleString()}`].join('\n')
			);
		}

		if (diceBalance < args.wager * args.multiplier - args.wager) {
			return message.util?.send("I couldn't pay your winnings if you won");
		}

		// Take away the players wager
		[{balance: authorBalance}] = await this.client.prisma.transaction([
			(await author.incrementBalanceWithPrisma(-args.wager))(),
			(await dice.incrementBalanceWithPrisma(args.wager))()
		]);

		const randomNumber = simpleFormat(Math.random());
		/** Whether or not the author won this round. */
		const authorWon = randomNumber < winPercentage(args.multiplier);
		/** The revenue the author would make if they won the game. */
		const revenue = args.wager * args.multiplier;
		/** The profit the author would make if they won the game. */
		const profit = revenue - args.wager;

		if (authorWon) {
			// Pay the author their winnings from Dice if they won
			[{balance: authorBalance}] = await this.client.prisma.transaction([
				(await author.incrementBalanceWithPrisma(revenue))(),
				(await dice.incrementBalanceWithPrisma(-revenue))()
			]);
		}

		const embed = new MessageEmbed({
			title: bold`${args.wager.toLocaleString()} × ${args.multiplier}`,
			color: authorWon ? Colors.Success : Colors.Error
		});

		const summary = [
			`You had a ${bold`${simpleFormat(winPercentage(args.multiplier) * 100)}%`} chance of winning that wager`,
			`Your updated balance is ${bold`${authorBalance.toLocaleString()}`}`
		];

		if (authorWon) {
			summary.unshift(`You made ${bold`${profit.toLocaleString()}`} oats of profit`);
		} else {
			summary.unshift(`You lost ${bold`${args.wager.toLocaleString()}`} oats`);
		}

		embed.setDescription(summary.join('\n'));

		return message.util?.send(embed);
	}
}
