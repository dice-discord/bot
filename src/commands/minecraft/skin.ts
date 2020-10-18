import {Message, Permissions} from 'discord.js';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {crafatarArgs, downloadImage, genericErrorMessage} from '../../util/crafatar';
import {MinecraftAccount} from '../../util/player-db';

export default class SkinCommand extends DiceCommand {
	constructor() {
		super('skin', {
			aliases: ['get-skin', 'get-mc-skin', 'get-minecraft-skin', 'mc-skin', 'minecraft-skin'],
			description: {
				content: "Get a Minecraft user's skin (via Crafatar).",
				usage: '<player>',
				examples: ['notch']
			},
			category: DiceCommandCategories.Minecraft,
			clientPermissions: [Permissions.FLAGS.ATTACH_FILES],
			typing: true,
			args: [crafatarArgs.player]
		});
	}

	async exec(message: Message, args: {player: MinecraftAccount}): Promise<Message | undefined> {
		let image: Buffer;

		try {
			image = await downloadImage({imageType: 'skin', playerUUID: args.player.id});
		} catch (error: unknown) {
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
