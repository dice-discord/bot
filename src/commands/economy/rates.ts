import {Client as Discoin} from '@discoin/scambio';
import {Currency} from '@discoin/scambio/tsc_output/src/types/discoin';
import {formatTable, maxColumnLength} from '@jonahsnider/util';
import {Message, Permissions} from 'discord.js';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';

/**
 * Sorts currencies by value descending, but puts oats before everything else.
 * @param a First currency to compare
 * @param b Second currency to compare
 * @returns The order to move elements around, compatible with Array.prototype#sort
 */
function narcissisticSort(a: Currency, b: Currency): -1 | 1 | number {
	if (a.id === 'OAT') {
		return -1;
	}

	if (b.id === 'OAT') {
		return 1;
	}

	return b.value - a.value;
}

export default class RatesCommand extends DiceCommand {
	constructor() {
		super('rates', {
			aliases: ['discoin-rates', 'conversion-rates', 'convert-rates'],
			description: {content: 'Lists the conversion rates for Discoin currencies.', examples: [''], usage: ''},
			category: DiceCommandCategories.Economy,
			clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
			typing: true
		});
	}

	async exec(message: Message): Promise<Message | undefined> {
		const currencies: Currency[] = [];

		try {
			const bots = await Discoin.bots.getMany();

			for (const bot of Array.isArray(bots) ? bots : bots.data) {
				for (const currency of bot.currencies) {
					currency.name = `${bot.name} ${currency.name}`;
					currencies.push(currency);
				}
			}
		} catch (error: unknown) {
			this.logger.error(error);

			// eslint-disable-next-line no-return-await
			return await message.util?.send(
				['An error occurred while fetching currencies', 'Please try again later, and if the error keeps occurring report this to a developer'].join('\n')
			);
		}

		const oatsCurrency = currencies.find(currency => currency.id === 'OAT');

		currencies.sort(narcissisticSort);

		const header = ['#', 'Name', '', 'ID', '', 'Discoin value', '', '', 'OAT value', ''];

		const data = currencies.map((currency, index): string[] => [
			`${(index + 1).toLocaleString()}.`,
			currency.name,
			'1',
			`${currency.id}`,
			'=',
			`${currency.value.toLocaleString()}`,
			'D$',
			'=',
			`${(currency.value / oatsCurrency!.value).toLocaleString()}`,
			'OAT'
		]);

		const maxLengths = maxColumnLength([...data, header]);

		const divider = header.map((heading, index) => (heading.length === 0 ? '' : '-'.repeat(maxLengths[index])));

		const table = [header, divider, ...data];

		return message.util?.send(formatTable(table), {code: 'markdown'});
	}
}
