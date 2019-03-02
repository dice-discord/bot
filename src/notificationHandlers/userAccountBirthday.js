const { oneLine } = require("common-tags");

/**
 * Announces the account birthday of a member on a guild
 * @param {TextChannel} channel Channel to send the embed
 * @param {User} user User who's account birthday occured
 */
module.exports = (channel, user) =>
  channel.send({
    embed: {
      title: "Discord Account Birthday",
      thumbnail: {
        url: "https://dice.js.org/images/statuses/birthday/cake.png"
      },
      description: oneLine`It's the Discord account birthday of ${user.tag}.
    On this day in ${user.createdAt.getFullYear()} they created their Discord account.`,
      timestamp: new Date(),
      color: 0x4caf50,
      author: {
        name: `${user.tag} (${user.id})`,
        iconURL: user.displayAvatarURL(128)
      }
    }
  });
