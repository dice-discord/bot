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

const config = {
  backend: process.env.BACKEND,
  botListTokens: {
    'botlist.space': process.env.BOTLIST_SPACE_TOKEN,
    'bots.discord.pw': process.env.BOTS_DISCORD_PW_TOKEN,
    'bots.ondiscord.xyz': process.env.BOTS_ONDISCORD_XYZ_TOKEN,
    'discord.services': process.env.DISCORD_SERVICES_TOKEN,
    'discordboats.club': process.env.DISCORDBOATS_CLUB_TOKEN,
    'discordbot.world': process.env.DISCORDBOAT_WORLD_TOKEN,
    'discordbots.group': process.env.DISCORDBOTS_GROUP_TOKEN,
    'discordbots.org': process.env.DISCORDBOTS_ORG_TOKEN
  },
  clientID: process.env.CLIENT_ID,
  commandPrefix: process.env.COMMAND_PREFIX,
  currency: {
    plural: 'oats',
    singular: 'oat'
  },
  currencyCodes: [
    'aud',
    'brl',
    'cad',
    'chf',
    'clp',
    'cny',
    'czk',
    'dkk',
    'eur',
    'gbp',
    'hkd',
    'huf',
    'idr',
    'ils',
    'inr',
    'jpy',
    'krw',
    'mxn',
    'myr',
    'nok',
    'nzd',
    'php',
    'pkr',
    'pln',
    'rub',
    'sek',
    'sgd',
    'thb',
    'try',
    'twd',
    'zar'
  ],
  discoinCurrencyCodes: [
    'dts',
    'elt',
    'kek',
    'rbn'
  ],
  discoinToken: process.env.DISCOIN_TOKEN,
  discordBotsDotOrgToken: process.env.DISCORDBOTS_ORG_TOKEN,
  discordToken: process.env.DISCORD_TOKEN,
  fortniteTrackerNetworkToken: process.env.FORTNITE_TRACKER_NETWORK_TOKEN,
  houseEdgePercentage: 1,
  houseStartingBalance: 750000,
  invites: {
    bot: 'http://dice.js.org/invite',
    server: 'https://discord.gg/NpUmRkj'
  },
  keen: {
    projectID: process.env.KEEN_PROJECT_ID,
    writeKey: process.env.KEEN_WRITE_KEY
  },
  maxMultiplier: 100,
  minCurrency: 1,
  minMultiplier: 1.01,
  mongoDBURI: process.env.MONGODB_URI,
  newUserBalance: 500,
  notifications: [{
    label: 'ban and unban',
    name: 'banUnban'
  },
  {
    label: 'member join and leave',
    name: 'guildMemberJoinLeave'
  },
  {
    label: 'voice channel',
    name: 'voiceChannel'
  },
  {
    label: 'nickname change',
    name: 'guildMemberUpdate'
  },
  {
    label: 'user account birthday',
    name: 'userAccountBirthday'
  },
  {
    label: 'message delete',
    name: 'messageDelete'
  },
  {
    label: 'message update/edit',
    name: 'messageUpdate'
  }],
  owners: [
    '210024244766179329'
  ],
  patrons: {
    userID: {
      basic: true,
      crown: true
    }
  },
  sentryDSN: process.env.SENTRY_DSN,
  emoji: {
    success: {
      message: '<:success:406965554629574658>',
      id: '406965554629574658'
    }
  },
  webhooks: {
    discoin: process.env.DISCOIN_WEBHOOK_URL,
    updates: process.env.UPDATES_WEBHOOK_URL
  }
};

module.exports = config;
