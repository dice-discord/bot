/** @function
 * @name respond
 * @param {Message} message Message to respond to
 * @param {GuildMemberResolvable} clientGuildMember Guild member of client responding to the message
 * @param {string} fallbackResponse Response to send if unable to react
 */
const respond = (message, clientGuildMember, fallbackResponse) => {
	switch (message.channel.type) {
	case 'text':
		if (message.channel.permissionsFor(clientGuildMember).has('ADD_REACTIONS') && message.channel.permissionsFor(clientGuildMember).has('USE_EXTERNAL_EMOJIS')) {
			// Can add the custom emoji
			message.react('406965554629574658');
		} else if (message.channel.permissionsFor(clientGuildMember).has('ADD_REACTIONS')) {
			// Can add a built-in emoji
			message.react('✅');
		} else {
			// Can't add emoji
			message.reply(fallbackResponse);
		}
		break;
	case 'groupdm':
	case 'dm':
		message.react('406965554629574658');
		break;
	default:
		null;
	}


};
module.exports.respond = respond;
