// Copyright Jonah Snider 2018

const moment = require('moment');
const { Util, MessageEmbed } = require('discord.js');

/**
 * Keep code for GameDig commands that are for Source games (same protocol = same information)
 * @name srcdsHelper
 * @param {Object} data Result from GameDig
 * @returns {MessageEmbed}
 */
module.exports = data => new MessageEmbed({
  title: data.name,
  footer: { text: `Took ${moment.duration(data.query.duration).asSeconds().toFixed(2)} seconds to complete` },
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
