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
const logger = require("../../util/logger").scope(
  "command",
  "garrys mod server status"
);
const srcdsHelper = require("../../util/srcdsHelper");
const gamedig = require("gamedig");

module.exports = class GarrysModServerStatusCommand extends Command {
  constructor(client) {
    super(client, {
      name: "garrys-mod-server-status",
      group: "games",
      memberName: "garrys-mod-server-status",
      description: "Get information about a Garry's Mod server.",
      aliases: ["gmod-server", "garrys-mod-server", "gmod-status", "gmod"],
      examples: [
        "garrys-mod-server-status RP.SuperiorServers.co",
        "garrys-mod-server-status 185.97.255.6 27016"
      ],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [
        {
          key: "host",
          prompt: "What is the IP address or host you want to look up?",
          type: "string"
        },
        {
          key: "port",
          prompt: "What is the server's port?",
          type: "integer",
          default: 27015,
          max: 65535,
          min: 1
        }
      ]
    });
  }

  run(msg, { host, port }) {
    try {
      msg.channel.startTyping();
      const options = {
        host,
        type: "garrysmod"
      };

      if (port) {
        options.port = port;
      }

      gamedig
        .query(options)
        .then(data => {
          const embed = srcdsHelper(data);
          embed.setThumbnail(
            "https://steamcdn-a.akamaihd.net/steam/apps/4000/header.jpg"
          );
          return msg.replyEmbed(embed);
        })
        .catch(error => {
          if (error === "UDP Watchdog Timeout")
            return msg.reply("Server timed out, it's probably offline.");

          logger.error(error);
          return msg.reply("An unknown error occured.");
        });
    } finally {
      msg.channel.stopTyping();
    }
  }
};
