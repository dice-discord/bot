/*
Copyright 2019 Jonah Snider

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

const ms = require("ms");
const { Util, MessageEmbed } = require("discord.js");

/**
 * Quickly create an embed for a GameDig status using values found in all responses
 * @name gamedigHelper
 * @param {Object} res Result from GameDig
 * @returns {MessageEmbed}
 */
module.exports = res => {
  const playerCount = res.players.length;
  const maxPlayers = res.maxplayers;

  const embed = new MessageEmbed({
    title: res.name,
    footer: {
      text: `Took ${ms(res.ping)} to complete`
    },
    fields: [
      {
        name: "Connect",
        value: `${res.connect}`
      },
      {
        name: "Online Players",
        value: `${playerCount}/${maxPlayers} (${Math.round((playerCount / maxPlayers) * 100)}%)`
      },
      {
        name: "Map",
        value: Util.escapeMarkdown(res.map)
      },
      {
        name: "Password Required",
        value: res.password ? "Yes" : "No"
      }
    ]
  });

  const unconfirmedValues = new Map([
    [res.raw.secure, secure => embed.addField("VAC Secured", secure ? "Yes" : "No")],
    [res.raw.game, game => embed.addField("Game", Util.escapeMarkdown(game))]
  ]);

  unconfirmedValues.forEach((val, key) => {
    if (typeof key !== "undefined") val(key);
  });

  return embed;
};
