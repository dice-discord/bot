/** @function
 * @name respond
 * @param {Message} msg Message to respond to
 * @param {GuildMember} clientGuildMember Guild member of client responding to the message
 * @param {string} fallbackResponse Response to send if unable to react
 */
const respond = (msg, clientGuildMember, fallbackResponse) => {
	switch (msg.channel.type) {
	case 'text':
		if (msg.channel.permissionsFor(clientGuildMember).has('ADD_REACTIONS') && msg.channel.permissionsFor(clientGuildMember).has('USE_EXTERNAL_EMOJIS')) {
			// Can add the custom emoji
			msg.react('406965554629574658');
		} else if (msg.channel.permissionsFor(clientGuildMember).has('ADD_REACTIONS')) {
			// Can add a built-in emoji
			msg.react('✅');
		} else {
			// Can't add emoji
			msg.reply(fallbackResponse);
		}
		break;
	case 'groupdm':
	case 'dm':
		msg.react('406965554629574658');
		break;
	default:
		null;
	}


};
module.exports.respond = respond;
