import SingleResponseCommand from '../../structures/SingleResponseCommand';
import {MessageEmbed} from 'discord.js';

const response = new MessageEmbed({
	author: {
		name: 'Discord Nitro',
		iconURL: 'https://cdn.discordapp.com/emojis/314068430611415041.png',
		url: 'https://discordapp.com/nitro'
	},
	thumbnail: {
		url: 'https://cdn.discordapp.com/emojis/314068430611415041.png'
	},
	color: 0x8395d3,
	description: [`This message can only be viewed by users with Discord Nitro.`, `[Lift off with Discord Nitro today](https://discordapp.com/nitro).`].join('\n')
});

export default class NitroCommand extends SingleResponseCommand {
	constructor() {
		super('nitro', {
			aliases: ['discord-nitro', 'nitro-message', 'nitro-msg'],
			description: 'This message can only be viewed by users with Discord Nitro.',
			response
		});
	}
}
