import Discoin from '@discoin/scambio';
import {Transaction} from '@discoin/scambio/tsc_output/src/structures/transactions';
import {Argument} from 'discord-akairo';
import {Message, MessageEmbed, Permissions} from 'discord.js';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../../structures/DiceCommand';
import {DiceUser} from '../../../structures/DiceUser';
import {simpleFormat} from '../../../util/format';

const range = {min: 1, max: 1_000};
/** The length of a Discoin currency code. */
const discoinCurrencyCodeLength = 3;

export default class ConvertCommand extends DiceCommand {
	constructor() {
		super('convert', {
			aliases: ['convert-oats', 'convert-currencies', 'exchange-oats', 'exchange', 'exchange-currencies'],
			description: {content: 'Converts oats to another currency on the Discoin network.', usage: '<amount> <currency>', examples: ['500 dts']},
			category: DiceCommandCategories.Util,
			clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
			typing: true,
			args: [
				{
					id: 'amount',
					type: Argument.range(AkairoArgumentType.Number, range.min, range.max, true),
					match: 'phrase',
					prompt: {
						start: 'How many oats do you want to convert to another Discoin currency?',
						retry: `Invalid amount provided, please provide an amount from ${range.min.toLocaleString()} to ${range.max.toLocaleString()}`
					}
				},
				{
					id: 'currency',
					type: Argument.validate(AkairoArgumentType.Uppercase, (message, phrase) => phrase.length === discoinCurrencyCodeLength),
					match: 'rest',
					prompt: {start: 'Which currency do you want to convert to?', retry: 'Invalid currency provided, please provide a 3 letter currency code'}
				}
			]
		});
	}

	async exec(message: Message, {amount, currency}: {amount: number; currency: string}): Promise<Message | undefined> {
		if (!this.client.discoin) {
			return message.util?.send('Discoin is not enabled for this bot');
		}

		if (currency === 'OAT') {
			return message.util?.send('You may not convert from oats to oats');
		}

		amount = simpleFormat(amount);

		const author = new DiceUser(message.author);
		const authorBal = await author.getBalance();

		if (amount > authorBal) {
			return message.util?.send(`You are missing ${simpleFormat(amount - authorBal).toLocaleString()} oats`);
		}

		try {
			await Discoin.currencies.getOne(currency);
		} catch {
			// eslint-disable-next-line no-return-await
			return await message.util?.send(['An error occurred while validating that currency', 'Are you sure it exists?'].join('\n'));
		}

		let transaction: Transaction;

		try {
			transaction = await this.client.discoin.transactions.create({amount, to: currency, user: message.author.id});
		} catch (error) {
			this.logger.error(error);
			// eslint-disable-next-line no-return-await
			return await message.util?.send(
				['An error occurred while converting', 'If this error keeps happening try contacting the Discoin administrators or the Dice staff'].join('\n')
			);
		}

		await author.incrementBalance(-amount);

		return message.util?.send(
			new MessageEmbed({
				title: 'Conversion Successful',
				url: `https://dash.discoin.zws.im/#/transactions/${transaction.id}/show`,
				color: 0x4caf50,
				timestamp: transaction.timestamp,
				description: `You should be paid in around 5 minutes. If you aren’t paid within 10 minutes try contacting the creator of ${transaction.to.name}.`,
				fields: [
					{
						name: 'Payout',
						value: `${amount.toLocaleString()} OAT ➡ ${transaction.payout.toLocaleString()} ${transaction.to.id}`
					},
					{
						name: 'Transaction ID',
						value: `[\`${transaction.id}\`](https://dash.discoin.zws.im/#/transactions/${transaction.id}/show)`
					}
				]
			})
		);
	}
}
