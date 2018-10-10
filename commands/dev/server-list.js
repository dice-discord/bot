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

const { Command } = require('discord.js-commando');
const config = require('../../config');

module.exports = class ServerListCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'server-list',
      group: 'dev',
      memberName: 'server-list',
      description: `List all servers <@${config.clientID}> is on.`,
      details: 'Only the bot owner(s) may use this command.',
      aliases: ['list-servers', 'guild-list', 'list-guilds'],
      throttling: {
        usages: 2,
        duration: 30
      },
      ownerOnly: true
    });
  }

  run(msg) {
    const { guilds } = this.client;
    const guildList = [];

    // For each guild the bot is in, add it to the list
    for (const guild of guilds.values()) {
      guildList.push(`${guild.name} (\`${guild.id}\`)`);
    }

    return msg.reply(`${guildList.join('\n')}\n
		👥 ${guilds.size} servers in total. ${guildList.length} servers were listed.`, { split: true });
  }
};
