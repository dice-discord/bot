import ms = require('pretty-ms');
import {Stopwatch} from '@jonahsnider/util';
import {Argument} from 'discord-akairo';
import {Message, MessageEmbed} from 'discord.js';
import got from 'got';
// eslint-disable-next-line import/extensions
import type {Forecast, ForecastInputZipCode} from '../../../types/airnow';
import {airNowApiToken} from '../../config';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';

const aqiColors = ['#48E400', '#FEFE00', '#F67D00', '#F40000', '#8B3F99', '#780021'];

export default class AqiCommand extends DiceCommand {
	constructor() {
		super('aqi', {
			aliases: ['get-aqi', 'zipcode-aqi'],
			description: {content: 'Get the AQI (air quality index) for a ZIP code.', examples: ['94124'], usage: '<zip>'},
			category: DiceCommandCategories.Util,
			args: [
				{
					id: 'zip',
					type: Argument.validate(AkairoArgumentType.Integer, (message, phrase, value: number) => value.toString().length <= 10),
					match: 'content',
					prompt: {start: 'What ZIP code would you like to look up?', retry: 'Invalid ZIP code, please try again'}
				}
			]
		});
	}

	async exec(message: Message, args: {zip: number}): Promise<Message | undefined> {
		if (airNowApiToken === undefined) {
			this.logger.error('No AirNow API token was found');

			return message.util?.send("Sorry, the developers haven't configured this command for use");
		}

		const data: ForecastInputZipCode = {
			// eslint-disable-next-line camelcase
			api_key: airNowApiToken,
			format: 'application/json',
			zipCode: args.zip.toString()
		};

		const stopwatch = new Stopwatch();

		let aqi;
		stopwatch.start();
		try {
			const request = got<Forecast[]>('aq/forecast/zipCode', {
				prefixUrl: 'https://www.airnowapi.org',
				searchParams: (data as unknown) as Record<string, string>,
				responseType: 'json'
			});

			const response = await request;

			if (response.body.length === 0) {
				return await message.util?.send('There were no results');
			}

			aqi = response.body[0];
		} catch (error: unknown) {
			this.logger.error(error);

			// eslint-disable-next-line no-return-await
			return await message.util?.send('An error occurred while getting the AQI');
		}

		const elapsed = Number(stopwatch.end());

		const embed = new MessageEmbed()
			.setTimestamp(new Date(aqi.DateForecast))
			.setFooter(`Took ${ms(elapsed)}`)
			.setTitle(`${aqi.Latitude}, ${aqi.Longitude} (${aqi.ReportingArea})`)
			.setDescription([`${aqi.AQI} (${aqi.ParameterName})`, aqi.Discussion].join('\n'))
			.setColor(aqiColors[aqi.Category.Number - 1] ?? undefined);

		return message.util?.send(embed);
	}
}
