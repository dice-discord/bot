/*
Copyright 2018 Jonah Snider

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const SentryCommand = require("../../structures/SentryCommand");
const { MessageEmbed } = require("discord.js");
const respond = require("../../util/simpleCommandResponse");
const logger = require("../../util/logger").scope("command", "notifications");
const { notifications } = require("../../config");

module.exports = class NotificationsCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "notifications",
      aliases: [
        "notification",
        "notify",
        "alerts",
        "server-notifications",
        "server-notification",
        "server-notify",
        "server-alerts"
      ],
      group: "mod",
      memberName: "notifications",
      description: "Check or set what notifications for server events are sent to a channel.",
      details: "Not specifying an event type to toggle will list the statuses of all events in the channel",
      userPermissions: ["MANAGE_GUILD"],
      clientPermissions: ["EMBED_LINKS"],
      examples: ["notifications 1", "notifications"],
      guildOnly: true,
      args: [
        {
          key: "notification",
          prompt: "Which notification do you want to toggle for this channel?",
          type: "integer",
          min: 1,
          max: notifications.length,
          default: false
        }
      ],
      throttling: {
        usages: 2,
        duration: 10
      }
    });
  }

  async exec(msg, { notification }) {
    // Get this guild's settings
    const guildSettings = await this.client.provider.get(msg.guild.id, "notifications", {});

    if (!guildSettings[msg.channel.id]) {
      logger.debug(`The channel ${msg.channel.name} does not have settings, will set them to the default`);
      // This channel doesn't have settings for it so set it to the default values (everything disabled)
      guildSettings[msg.channel.id] = [].fill(false, 0, 6);
    }

    // Get the settings
    const channelSettings = guildSettings[msg.channel.id];
    logger.debug(`Channel settings for ${msg.channel.name}:`, channelSettings);

    if (notification) {
      // If the setting was specified

      // Toggle the value on our local settings
      channelSettings[notification - 1] = !channelSettings[notification - 1];

      // Set the local guild settings for this channel to our updated configuration
      guildSettings[msg.channel.id] = channelSettings;

      // Set the guild settings to our updated version
      await this.client.provider.set(msg.guild.id, "notifications", guildSettings);

      // Respond to author with success
      respond(msg);

      return null;
    }

    // If the setting was unspecified
    const embed = new MessageEmbed({
      title: `Notifications for #${msg.channel.name}`
    });

    notifications.forEach(item => {
      const i = notifications.indexOf(item);
      embed.addField(
        `${channelSettings[i] ? "Disable" : "Enable"} ${item.label} notifications`,
        `Use ${msg.anyUsage(`notification ${i + 1}`)} to **${channelSettings[i] ? "disable" : "enable"}** this item`
      );
    });

    return msg.replyEmbed(embed);
  }
};
