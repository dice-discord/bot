import {Message, Permissions} from 'discord.js';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {Scale} from '../../types/crafatar';
import {crafatarArgs, downloadImage, genericErrorMessage} from '../../util/crafatar';
import {MinecraftAccount} from '../../util/player-db';

export default class BodyCommand extends DiceCommand {
	constructor() {
		super('body', {
			aliases: ['get-body', 'get-mc-body', 'get-minecraft-body', 'mc-body', 'minecraft-body'],
			description: {
				content: "Get an image of a Minecraft user's body (via Crafatar).",
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
			image = await downloadImage({imageType: 'body', playerUUID: args.player.id, overlay: args.overlay ?? false});
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
