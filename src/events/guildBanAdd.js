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

const announceGuildBanAdd = require("../notificationHandlers/guildBanAdd");

module.exports = async (guild, user) => {
  const { provider } = guild.client;
  const guildSettings = await provider.get(guild, "notifications");

  for (const id in guildSettings) {
    const channelSettings = guildSettings[id];

    if (
      guild.channels.has(id) &&
      channelSettings[0] === true &&
      guild.channels
        .get(id)
        .permissionsFor(guild.me)
        .has("SEND_MESSAGES")
    ) {
      // The channel in the database exists on the server and permissions to send messages are there
      announceGuildBanAdd(guild.channels.get(id), user);
    } else {
      // Missing permissions so remove this channel from the provider
      channelSettings[0] = false;
      guildSettings[id] = channelSettings;
      provider.set(guild, "notifications", guildSettings);
    }
  }
};
