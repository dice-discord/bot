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
