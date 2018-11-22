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
const moment = require('moment');
const { stripIndents } = require('common-tags');

module.exports = class OldestMemberCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'oldest-member',
      group: 'fun',
      memberName: 'oldest-member',
      description: 'See who the oldest member on the server is.',
      aliases: [
        'oldest-user',
        'oldest'
      ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 6
      }
    });
  }

  run(msg) {
    const oldest = msg.guild.members
      .sort((member1, member2) => {
        const timestamp1 = member1.user.createdTimestamp;
        const timestamp2 = member2.user.createdTimestamp;

        if (timestamp1 > timestamp2) {
          return 1;
        } else if (timestamp1 < timestamp2) {
          return -1;
        }
        return 0;
      })
      .first()
      .user;


    const duration = moment.duration(msg.createdAt - oldest.createdAt).humanize();
    return msg.reply(stripIndents`${oldest.tag} is the oldest member on this server.
    Their account was created ${duration} ago (${oldest.createdAt})`);
  }
};
