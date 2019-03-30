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
const gameDigHelper = require("../../util/gameDigHelper");
const logger = require("../../util/logger").scope("command", "csgo server status");
const gamedig = require("gamedig");

module.exports = class CSGOStatusCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "csgo-server-status",
      group: "games",
      memberName: "csgo-server-status",
      description: "Get information about a Counter-Strike Global Offensive server.",
      aliases: [
        "csgo-server",
        "counter-strike-server",
        "counter-strike-status",
        "counter-strike",
        "csgo-status",
        "csgo",
        "counter-strike-global-offensive",
        "counter-strike-global-offensive-server-status",
        "counter-strike-global-offensive-server",
        "counter-strike-global-offensive-status",
        "counter-strike-global-offensive"
      ],
      examples: ["csgo-server-status 74.91.123.188", "csgo-server-status  Zombie.Mapeadores.com 27040"],
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
        type: "csgo"
      };

      if (port) {
        options.port = port;
      }

      gamedig
        .query(options)
        .then(data => {
          const embed = gameDigHelper(data);
          embed.setThumbnail("https://steamcdn-a.akamaihd.net/steam/apps/730/header.jpg");
          return msg.replyEmbed(embed);
        })
        .catch(error => {
          if (error === "UDP Watchdog Timeout") return msg.reply("Server timed out, it's probably offline.");

          logger.error(error);
          return msg.reply("An unknown error occured.");
        });
    } finally {
      msg.channel.stopTyping();
    }
  }
};
