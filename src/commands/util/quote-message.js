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
const path = require("path");
const logger = require("../../util/logger").scope("command", "quote message");
const truncateText = require("../../util/truncateText");

module.exports = class QuoteMessageCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "quote-message",
      aliases: ["quote"],
      group: "util",
      memberName: "quote-message",
      description: "Quote a message from a text channel.",
      examples: ["quote-message 424936127154094080"],
      guildOnly: true,
      args: [
        {
          key: "message",
          prompt: "What message do you want to quote?",
          type: "message",
          label: "message ID"
        }
      ],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 2,
        duration: 6
      }
    });
  }

  run(msg, { message }) {
    const embed = new MessageEmbed({
      timestamp: message.createdAt,
      author: {
        name: message.author.tag,
        iconURL: message.author.displayAvatarURL(128)
      },
      fields: [
        {
          name: "Channel",
          value: message.channel.toString()
        },
        {
          name: "Message",
          value: `[Jump to](https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`
        }
      ]
    });

    // Check if message had content
    logger.debug("Does the message have content:", Boolean(message.content));
    if (message.content) embed.setDescription(truncateText(message.content));

    // The image from the message
    let messageImage;
    // Valid image file extensions
    const extensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
    // RegEx for a URL to an image
    const linkRegex = /https?:\/\/(?:\w+\.)?[\w-]+\.[\w]{2,3}(?:\/[\w-_.]+)+\.(?:png|jpg|jpeg|gif|webp)/;

    // Embed (that may or may not exist) with an image in it
    const imageEmbed = message.embeds.find(
      msgEmbed => msgEmbed.type === "rich" && msgEmbed.image && extensions.includes(path.extname(msgEmbed.image.url))
    );
    if (imageEmbed) messageImage = imageEmbed.image.url;

    // Uploaded image
    const attachment = message.attachments.find(file => extensions.includes(path.extname(file.url)));
    if (attachment) {
      messageImage = attachment.url;
    }

    // If there wasn't an uploaded image check if there was a URL to one
    if (!messageImage) {
      const linkMatch = message.content.match(linkRegex);
      if (linkMatch && extensions.includes(path.extname(linkMatch[0]))) {
        [messageImage] = linkMatch;
      }
    }

    // If there was an image, set the embed's image to it
    if (messageImage) embed.setImage(messageImage);

    return msg.replyEmbed(embed);
  }
};
