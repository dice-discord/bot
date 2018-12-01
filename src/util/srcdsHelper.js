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

const ms = require('ms');
const { Util, MessageEmbed } = require('discord.js');

/**
 * Keep code for GameDig commands that are for Source games (same protocol = same information)
 * @name srcdsHelper
 * @param {Object} data Result from GameDig
 * @returns {MessageEmbed}
 */
module.exports = data => new MessageEmbed({
  title: data.name,
  footer: { text: `Took ${ms(data.query.duration)} to complete` },
  fields: [{
    name: 'IP Address',
    value: `${data.query.address} (port ${data.query.port})`
  }, {
    name: 'Online Players',
    value: `${data.raw.numplayers}/${data.maxplayers} (${Math.round((data.raw.numplayers / data.maxplayers) * 100)}%)`
  }, {
    name: 'Map',
    value: Util.escapeMarkdown(data.map)
  }, {
    name: 'Password Required',
    value: data.password ? 'Yes' : 'No'
  }, {
    name: 'Game',
    value: Util.escapeMarkdown(data.raw.game)
  }, {
    name: 'Secure',
    value: data.raw.secure ? 'Yes' : 'No'
  }]
});
