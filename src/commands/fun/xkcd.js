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

const { Command } = require("discord.js-commando");
const { MessageEmbed } = require("discord.js");
const axios = require("axios");
const logger = require("../../util/logger").scope("command", "xkcd");
const truncateText = require("../../util/truncateText");

module.exports = class XKCDCommand extends Command {
  constructor(client) {
    super(client, {
      name: "xkcd",
      group: "fun",
      memberName: "xkcd",
      description: "Get an XKCD comic.",
      details: "Not specifying the comic to lookup will give you the most recent comic",
      aliases: ["random-xkcd", "xkcd-comic", "random-xkcd-comic"],
      examples: ["xkcd", "xkcd 614"],
      clientPermissions: ["EMBED_LINKS"],
      args: [
        {
          key: "comic",
          prompt: "What comic number do you want see?",
          type: "integer",
          default: "latest",
          min: 1
        }
      ],
      throttling: {
        usages: 2,
        duration: 6
      }
    });
  }

  async run(msg, { comic }) {
    try {
      msg.channel.startTyping();

      const uri = `https://xkcd.com/${comic === "latest" ? "" : comic}/info.0.json`;

      const result = (await axios.get(uri)).data;

      // Result embed
      const embed = new MessageEmbed({
        title: `${result.safe_title} (#${result.num})`,
        author: {
          name: "XKCD",
          iconURL: "https://i.imgur.com/AP0vVy5.png",
          url: "https://xkcd.com"
        }
      });

      // Check if comic exists
      if (result.img) {
        embed.setImage(result.img);
      } else {
        return msg.reply("Couldn't find that comic");
      }

      // Alt text
      if (result.alt) {
        embed.addField("Alt", truncateText(result.alt, 1024));
      }

      // Transcript
      if (result.transcript) {
        embed.addField("Transcript", truncateText(result.transcript, 1024));
      }

      // Check if there's a link
      embed.setURL(result.link || `https://xkcd.com/${result.num}`);

      // Creation date
      if (result.day && result.month && result.year) {
        embed.setTimestamp(new Date(result.year, result.month - 1, result.day));
      }

      return msg.replyEmbed(embed);
    } catch (error) {
      logger.error(error);
      return msg.reply("There was an error with the XKCD website");
    } finally {
      msg.channel.stopTyping();
    }
  }
};
