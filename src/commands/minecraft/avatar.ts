import {Argument} from 'discord-akairo';
import {Message, Permissions} from 'discord.js';
import got from 'got';
import {AkairoArgumentType, DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {Scale, Size} from '../../types/crafatar';
import {typeName as minecraftUser} from '../../types/minecraftUser';
import {MinecraftAccount} from '../../util/player-db';

const genericErrorMessage = 'There was an error while downloading the image from Crafatar (https://crafatar.com)';

export default class AvatarCommand extends DiceCommand {
	constructor() {
		super('avatar', {
			aliases: ['get-face', 'get-mc-face', 'get-minecraft-face', 'mc-avatar', 'minecraft-avatar'],
			description: {
				content: 'Get an avatar image of a Minecraft user (via Crafatar).',
				usage: '<player> [size:<size>] [scale:<scale>] [--overlay]',
				examples: ['notch', 'notch size:200', 'notch scale:5', 'notch --overlay', 'notch: size: 32 scale: 10 --overlay']
			},
			category: DiceCommandCategories.Minecraft,
			clientPermissions: [Permissions.FLAGS.ATTACH_FILES],
			typing: true,
			args: [
				{
					id: 'player',
					type: minecraftUser,
					match: 'content',
					prompt: {start: 'What Minecraft player (UUID or username) do you want to get the avatar for?', retry: 'Invalid player provided, please try again'}
				},
				{
					id: 'size',
					type: Argument.range(AkairoArgumentType.Integer, 1, 512),
					match: 'option',
					flag: 'size:',
					prompt: {retry: 'Invalid size provided, please provide the number of pixels from 1-512', optional: true},
					default: null
				},
				{
					id: 'overlay',
					match: 'flag',
					flag: '--overlay',
					prompt: {optional: true},
					default: null
				},
				{
					id: 'scale',
					type: Argument.range(AkairoArgumentType.Integer, 1, 10),
					match: 'option',
					flag: 'scale:',
					prompt: {retry: 'Invalid scale value provided, please provide a whole number from 1-10', optional: true},
					default: null
				}
			]
		});
	}

	async exec(
		message: Message,
		args: {player: MinecraftAccount; scale: Scale | null; overlay: boolean | null; size: Size | null}
	): Promise<Message | undefined> {
		const searchParameters = new URLSearchParams();

		if (args.scale) {
			searchParameters.append('scale', args.scale.toString());
		}

		if (args.overlay === true) {
			searchParameters.append('overlay', '');
		}

		if (args.size) {
			searchParameters.append('size', args.size.toString());
		}

		let image: Buffer;

		try {
			const request = got(`https://crafatar.com/avatars/${encodeURIComponent(args.player.id)}`, {searchParams: searchParameters});

			image = await request.buffer();
		} catch (error) {
			this.logger.error(error);

			// eslint-disable-next-line no-return-await
			return await message.util?.send(genericErrorMessage);
		}

		if (image) {
			return message.util?.send({files: [image]});
		}

		return message.util?.send([genericErrorMessage, 'No image was found'].join('\n'));
	}
}
