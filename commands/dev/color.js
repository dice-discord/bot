// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const { Util } = require('discord.js');
const parseColor = require('parse-color');

module.exports = class ColorCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'color',
			aliases: ['rgb', 'cmyk', 'hsv', 'hsl', 'hex', 'hexadecimal', 'colors'],
			group: 'dev',
			memberName: 'color',
			description: 'Display and convert a color.',
			details: 'Display and convert a color from and to hexadecimal, HSL, RGB, CMYK, and CSS name',
			examples: ['color blue', 'color #deaded', 'color hsl(210,50,50)'],
			args: [{
				key: 'color',
				prompt: 'What color do you want to get information on?',
				type: 'string'
			}],
			throttling: {
				usages: 2,
				duration: 60
			}
		});
	}

	run(msg, { color }) {
		try {
			msg.channel.startTyping();

			if(!color.startsWith('#') && color.length === 6) {
				// Hexadecimal missing the pound sign
				const testResult = parseColor(`#${color}`);
				if(!testResult.cmyk || !testResult.rgb || !testResult.hsv || !testResult.hsl || !testResult.hex) {
					// Invalid hexadecimal
					return msg.reply('❌ Invalid color.');
				} else {
					// Valid hexadecimal, missing pound sign
					color = testResult;
				}
			} else {
				// Other color type
				color = parseColor(color);
			}

			if(!color.cmyk || !color.rgb || !color.hsv || !color.hsl || !color.hex) {
				return msg.reply('❌ Invalid color.');
			}

			return msg.replyEmbed({
				color: Util.resolveColor(color.rgb),
				thumbnail: { url: `https://api.terminal.ink/colour?color=${color.hex.substring(1)}` },
				fields: [{
					name: 'CSS Keyword',
					value: color.keyword || 'None'
				},
				{
					name: 'Hexadecimal',
					value: color.hex.toString()
				}, {
					name: 'CMYK',
					value: color.cmyk.join(', ')
				}, {
					name: 'HSL',
					value: color.hsl.join(', ')
				}, {
					name: 'HSV',
					value: color.hsv.join(', ')
				}, {
					name: 'RGB',
					value: color.rgb.join(', ')
				}]
			});
		} finally {
			msg.channel.stopTyping();
		}
	}
};
