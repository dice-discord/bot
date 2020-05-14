import {Message, Permissions} from 'discord.js';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {Scale} from '../../types/crafatar';
import {crafatarArgs, downloadImage, genericErrorMessage} from '../../util/crafatar';
import {MinecraftAccount} from '../../util/player-db';

export default class HeadCommand extends DiceCommand {
	constructor() {
		super('head', {
			aliases: ['get-head', 'get-mc-head', 'get-minecraft-head', 'mc-head', 'minecraft-head'],
			description: {
				content: "Get an image of a Minecraft user's head (via Crafatar).",
				usage: '<player> [scale:<scale>] [--overlay]',
				examples: ['notch', 'notch scale:5', 'notch --overlay', 'notch scale:10 --overlay']
			},
			category: DiceCommandCategories.Minecraft,
			clientPermissions: [Permissions.FLAGS.ATTACH_FILES],
			typing: true,
			args: [crafatarArgs.player, crafatarArgs.scale, crafatarArgs.overlay]
		});
	}

	async exec(message: Message, args: {player: MinecraftAccount; scale: Scale | null; overlay: boolean | null}): Promise<Message | undefined> {
		let image: Buffer;

		try {
			image = await downloadImage({imageType: 'head', playerUUID: args.player.id, overlay: args.overlay ?? false});
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
