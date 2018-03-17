/** @function
 * @name respond
 * @param {Message} message Message to respond to
 */
const respond = message => {
	switch(message.channel.type) {
		case 'text':
			if(message.channel.permissionsFor(message.guild.me).has('ADD_REACTIONS') &&
			message.channel.permissionsFor(message.guild.me).has('USE_EXTERNAL_EMOJIS')) {
			// Can add the custom emoji
				message.react('406965554629574658');
			} else if(message.channel.permissionsFor(message.guild.me).has('ADD_REACTIONS')) {
			// Can add a built-in emoji
				message.react('✅');
			} else if(message.channel.permissionsFor(message.guild.me).has('USE_EXTERNAL_EMOJIS')) {
			// Can use custom emoji in a message
				message.reply('<:success:406965554629574658>');
			} else {
			// Can't use custom emoji
				message.reply('✅');
			}
			break;
		case 'groupdm':
		case 'dm':
			message.react('406965554629574658');
			break;
	}
};
module.exports.respond = respond;
