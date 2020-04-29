import * as util from 'util';
import {Message, Util} from 'discord.js';
import {DiceCommand, DiceCommandCategories, ArgumentType} from '../../structures/DiceCommand';
import {secrets} from '../../config';
import ms = require('pretty-ms');
import {italic, codeblock} from 'discord-md-tags';
import {captureException} from '@sentry/node';

const NL = '!!NL!!';
const NL_PATTERN = new RegExp(NL, 'g');

export default class EvalCommand extends DiceCommand {
	public lastResult = null;
	private _times: {
		/** Timestamp of when the script began in nanoseconds. */
		start?: bigint;
		/** Timestamp of when the script ended in nanoseconds. */
		end?: bigint;
		/** Duration of script execution time in nanoseconds. */
		diff?: bigint;
	} = {};

	public constructor() {
		super('eval', {
			description: {
				content: 'Evaluate a script',
				usage: '<script>'
			},
			category: DiceCommandCategories.Util,
			ownerOnly: true,
			ratelimit: 2,
			args: [
				{
					id: 'script',
					match: 'content',
					type: ArgumentType.String
				}
			]
		});
	}

	public async exec(message: Message, args: {script: string}): Promise<Message | Array<Promise<Message | undefined>> | undefined> {
		// #region scoped helpers
		/* eslint-disable @typescript-eslint/no-unused-vars */
		// Keep all of these here so they are in scope for the evaluated script
		// eslint-disable-next-line unicorn/prevent-abbreviations
		const msg = message;
		const {client, lastResult} = this;
		const {prisma, prisma: db, prisma: database} = this.client;
		const doReply = (value: Error | string): void => {
			if (value instanceof Error) {
				message.util?.send(`Callback error: \`${JSON.stringify(value)}\``).catch(error => {
					this.logger.error('Error why trying to send message about callback error', error);
					captureException(error);
				});
			} else {
				if (!this._times.diff) {
					this._times.diff = this._times.end! - this._times.start!;
				}

				const results = this._result(value, this._times.diff);
				for (const result of results) {
					message.util?.send(result).catch(error => {
						this.logger.error('Error while sending result message', error);
						captureException(error);
					});
				}
			}
		};
		/* eslint-enable @typescript-eslint/no-unused-vars */
		// #endregion

		try {
			this._times.start = process.hrtime.bigint();
			// eslint-disable-next-line no-eval
			this.lastResult = eval(args.script);
			this._times.end = process.hrtime.bigint();
			this._times.diff = this._times.end - this._times.start;
		} catch (error) {
			// eslint-disable-next-line no-return-await
			return await message.util?.send(`Error while evaluating: \`${String(error)}\``);
		}

		this._times.start = process.hrtime.bigint();
		const results = this._result(this.lastResult ?? '[no result]', this._times.diff, args.script);
		if (Array.isArray(results)) {
			return results.map(async result => message.util?.send(result));
		}

		return message.util?.send(results);
	}

	private _result(result: string, executionTimeNanoseconds: bigint, input?: string): string[] {
		const inspected = util
			.inspect(result, {depth: 0})
			.replace(NL_PATTERN, '\n')
			.replace(new RegExp(secrets.join('|'), 'gi'), '[redacted]');
		const lines = inspected.split('\n');
		const lastIndex = inspected.length - 1;
		const prependPart = !inspected.startsWith('{') && !inspected.startsWith('[') && !inspected.startsWith("'") ? lines[0] : inspected[0];
		const appendPart =
			inspected[lastIndex] !== '}' && inspected[lastIndex] !== ']' && inspected[lastIndex] !== "'" ? lines[lines.length - 1] : inspected[lastIndex];
		const prepend = `\`\`\`javascript\n${prependPart}\n`;
		const append = `\n${appendPart}\n\`\`\``;
		if (input) {
			return Util.splitMessage([italic`Executed in ${ms(Number(executionTimeNanoseconds) / 1_000_000)}.`, codeblock('javascript')`${inspected}`].join('\n'), {
				maxLength: 1900,
				prepend,
				append
			});
		}

		return Util.splitMessage(
			[italic`Callback executed after ${ms(Number(executionTimeNanoseconds) / 1_000_000)}.`, codeblock('javascript')`${inspected}`].join('\n'),
			{
				maxLength: 1900,
				prepend,
				append
			}
		);
	}
}
