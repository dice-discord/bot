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

// Set up dependencies
const { FriendlyError } = require("discord.js-commando");
const DiceClient = require("./structures/DiceClient");
const { MessageEmbed, WebhookClient } = require("discord.js");
const path = require("path");
const KeyvProvider = require("commando-provider-keyv");
const Keyv = require("keyv");
const KeenTracking = require("keen-tracking");
const database = require("./util/database");
const rp = require("request-promise-native");
const sentry = require("@sentry/node");
const config = require("./config");
const schedule = require("node-schedule");
// const { Batch } = require('reported');
const { Batch } = require("../../reported");
const stripWebhookURL = require("./util/stripWebhookURL");
const packageData = require("../package");
const ms = require("ms");

// Notification handlers
const announceGuildBanAdd = require("./notificationHandlers/guildBanAdd");
const announceGuildBanRemove = require("./notificationHandlers/guildBanRemove");
const announceGuildMemberJoin = require("./notificationHandlers/guildMemberJoin");
const announceGuildMemberLeave = require("./notificationHandlers/guildMemberLeave");
const announceVoiceChannelUpdate = require("./notificationHandlers/voiceChannelUpdate");
const announceGuildMemberUpdate = require("./notificationHandlers/guildMemberUpdate");
const announceUserAccountBirthday = require("./notificationHandlers/userAccountBirthday");

// Use Sentry
if (config.sentryDSN) {
  sentry.init({
    dsn: config.sentryDSN,
    release: packageData.version,
    environment: process.env.NODE_ENV || "development"
  });
}

// Set up bot client and settings
const client = new DiceClient({
  commandPrefix: config.commandPrefix,
  owner: config.owners,
  disableEveryone: true,
  unknownCommandResponse: false,
  invite: config.invites.server
});

// Get the loggers running with accurate scopes
const logger = require("./util/logger").scope(`shard ${client.shard.id}`);
const webhookLogger = logger.scope(`shard ${client.shard.id}`, "webhook");

// Set up Keen client
const keenClient = new KeenTracking({
  projectId: config.keen.projectID,
  writeKey: config.keen.writeKey
});

client.registry
  // Registers your custom command groups
  .registerGroups([
    ["util", "Utility"],
    ["mod", "Moderation"],
    ["search", "Search"],
    ["games", "Games"],
    ["fun", "Fun"],
    ["single", "Single response"],
    ["selfroles", "Selfroles"],
    ["minecraft", "Minecraft"],
    ["economy", "Economy"],
    ["dev", "Developer"]
  ])

  // Command argument types
  .registerDefaultTypes()

  // Command groups
  .registerDefaultGroups()

  // Default commands except the help command
  .registerDefaultCommands({
    help: false
  })

  // Register custom argument types in the ./types directory
  .registerTypesIn(path.join(__dirname, "types"))

  // Registers all of the commands in the ./commands directory
  .registerCommandsIn(path.join(__dirname, "commands"));

// Store settings (like a server prefix) in a Keyv instance
const copy = data => data;
const settings = {
  ttl: ms("1 year"),
  serialize: copy,
  deserialize: copy,
  collection: "settings"
};
const keyv = new Keyv(config.backend, settings);

client.setProvider(new KeyvProvider(keyv)).then(async () => {
  const blacklist = await client.provider.get("global", "blacklist", []);
  client.blacklist = blacklist;
});

client.dispatcher.addInhibitor(msg => {
  const { blacklist } = client;

  if (blacklist.includes(msg.author.id)) {
    return [
      "blacklisted",
      msg.reply(`You have been blacklisted from ${client.user.username}.`)
    ];
  }
  return false;
});

const checkDiscoinTransactions = async () => {
  const checkDiscoinTransactionsLogger = logger.scope(
    `shard ${client.shard.id}`,
    "discoin"
  );
  const transactions = await rp({
    json: true,
    method: "GET",
    url: "http://discoin.sidetrip.xyz/transactions",
    headers: { Authorization: config.discoinToken }
  }).catch(error => checkDiscoinTransactionsLogger.error(error));

  checkDiscoinTransactionsLogger.debug(
    "All Discoin transactions:",
    JSON.stringify(transactions)
  );

  for (const transaction of transactions) {
    if (transaction.type !== "refund") {
      checkDiscoinTransactionsLogger.debug(
        "Discoin transaction fetched:",
        JSON.stringify(transaction)
      );
      database.balances.increase(transaction.user, transaction.amount);

      if (config.webhooks.discoin) {
        const webhookData = stripWebhookURL(config.webhooks.discoin);
        const webhook = new WebhookClient(webhookData.id, webhookData.token);

        const user = await client.users.fetch(transaction.user);

        webhook
          .send({
            embeds: [
              {
                title: "Discoin Conversion Received",
                author: {
                  name: `${user.tag} (${user.id})`,
                  url: "https://discordapp.com",
                  // eslint-disable-next-line camelcase
                  icon_url: user.displayAvatarURL(128)
                },
                url: "https://discoin.sidetrip.xyz/record",
                timestamp: new Date(transaction.timestamp * 1000),
                thumbnail: {
                  url: "https://avatars2.githubusercontent.com/u/30993376"
                },
                fields: [
                  {
                    name: "Amount",
                    value: `${transaction.source} ➡ ${transaction.amount} OAT`
                  },
                  {
                    name: "Receipt",
                    value: `\`${transaction.receipt}\``
                  }
                ]
              }
            ]
          })
          .then(() => webhookLogger.debug("Sent Discoin webhook"))
          .catch(webhookLogger.error);
      }
    }
  }
};

const userAccountBirthdayLogger = logger.scope(
  `shard ${client.shard.id}`,
  "user account birthday"
);
// Every day at 00:00:00 UTC
schedule.scheduleJob("0 0 * * *", () => {
  // Find a list of users whose accounts were made on this day of this month
  const now = new Date();
  userAccountBirthdayLogger.debug("It's currently", now);
  client.guilds.filter(guild =>
    guild.members
      .filter(
        member =>
          member.user.createdAt.getDate() === now.getDate() &&
          member.user.createdAt.getMonth() === now.getMonth() &&
          member.user.createdAt.getFullYear() !== now.getFullYear() &&
          member.user.bot === false
      )
      .forEach(member => {
        userAccountBirthdayLogger.debug({
          prefix: `${member.user.tag} (${member.user.id})`,
          message:
            "Passed verification, their birthday is on this day of this month and they are human"
        });

        client.provider
          .get(member.guild, "notifications")
          .then(guildSettings => {
            for (const id in guildSettings) {
              const channelSettings = guildSettings[id];

              if (
                member.guild.channels.has(id) &&
                channelSettings[4] === true &&
                member.guild.channels
                  .get(id)
                  .permissionsFor(member.guild.me)
                  .has("SEND_MESSAGES")
              ) {
                // The channel in the database exists on the server and permissions to send messages are there
                announceUserAccountBirthday(
                  member.guild.channels.get(id),
                  member.user
                );
              } else {
                // Missing permissions so remove this channel from the provider
                channelSettings[4] = false;
                guildSettings[id] = channelSettings;
                client.provider.set(
                  member.guild,
                  "notifications",
                  guildSettings
                );
              }
            }
          });
      })
  );
});

/**
 * @name reportError
 * @param {Error} err The error that occured
 */
const reportError = err => {
  // Log the error
  logger.error(err);
  // Log the error on Sentry
  sentry.captureException(err);
};

/**
 * @name reportPromiseRejection
 * @param {Error} reason The error that occured
 * @param {Promise} promise The error that occured
 */
const reportPromiseRejection = (reason, promise) => {
  // Log the error and promise
  logger.error(reason, "at the promise", promise);
  // Log the error on Sentry
  sentry.captureException(reason);
};

client
  .on("unhandledRejection", (reason, promise) => {
    reportPromiseRejection(reason, promise);
  })
  .on("error", err => {
    reportError(err);
  })
  .on("rejectionHandled", (reason, promise) => {
    reportPromiseRejection(reason, promise);
  })
  .on("uncaughtException", err => {
    reportError(err);
  })
  .on("warning", warning => {
    logger.warn(warning);
    sentry.captureException(warning);
  })
  .on("commandError", (command, error) => {
    if (error instanceof FriendlyError) return;
    sentry.captureException(error);
    logger.error(error);
  })
  .on("ready", () => {
    logger.timeEnd("login");
    logger.info(`Logged in as ${client.user.tag}!`);

    // Set game presence to the help command once loaded
    client.user.setActivity("for @Dice help", { type: "WATCHING" });

    keenClient.recordEvent("events", {
      title: "Ready",
      tag: client.user.tag,
      shard: client.shard.id
    });

    // Only check for Discoin transactions and send bot stats if this is shard 0 and the production account
    // For some reason shard 0 will report its ID as an array with the only item being `0`
    console.error(client.shard.id[0]);
    if (
      (client.shard.id === 0 || client.shard.id[0] === 0) &&
      config.clientID === client.user.id
    ) {
      const botListLogger = logger.scope("bot list logger");

      const batchBotList = new Batch(config.botListTokens, client.user.id);
      batchBotList.on("status", (botList, token) => {
        botListLogger.debug("About to send stats for:", botList);
        botListLogger.debug(`Token for ${botList}:`, token);
      });

      const submitToBotLists = async () => {
        botListLogger.start("Sending stats to bot lists");
        const shards = await client.shard.broadcastEval("this.guilds.size");
        batchBotList
          .submit({
            serverCount: shards.reduce((prev, val) => prev + val, 0),
            shards
          })
          .then(() => {
            botListLogger.complete("Finished reporting stats to bot lists");
          })
          .catch(err => {
            botListLogger.error(err);
          });
      };

      submitToBotLists();
      schedule.scheduleJob("*/30 * * * *", submitToBotLists);

      schedule.scheduleJob("/5 * * * *", () => {
        checkDiscoinTransactions();
      });
    }

    // All shards before this have been spawned and this shard started up successfully
    if (
      client.shard.id + 1 === client.shard.count &&
      config.webhooks.updates &&
      client.user.id === config.clientID
    ) {
      const webhookData = stripWebhookURL(config.webhooks.updates);
      const webhook = new WebhookClient(webhookData.id, webhookData.token);

      webhook
        .send({
          embeds: [
            {
              color: 0x4caf50,
              title: `${client.user.username} Ready`,
              fields: [
                {
                  name: "Version",
                  value: `v${packageData.version}`
                }
              ],
              timestamp: new Date()
            }
          ]
        })
        .then(() => webhookLogger.debug("Sent ready webhook"))
        .catch(webhookLogger.error);
    }
  })
  .on("guildMemberAdd", async member => {
    const guildSettings = await client.provider.get(
      member.guild,
      "notifications"
    );

    for (const id in guildSettings) {
      const channelSettings = guildSettings[id];

      if (
        member.guild.channels.has(id) &&
        channelSettings[1] === true &&
        member.guild.channels
          .get(id)
          .permissionsFor(member.guild.me)
          .has("SEND_MESSAGES")
      ) {
        // The channel in the database exists on the server and permissions to send messages are there
        announceGuildMemberJoin(member.guild.channels.get(id), member);
      } else {
        // Missing permissions so remove this channel from the provider
        channelSettings[1] = false;
        guildSettings[id] = channelSettings;
        client.provider.set(member.guild, "notifications", guildSettings);
      }
    }
  })
  .on("guildMemberRemove", async member => {
    const guildSettings = await client.provider.get(
      member.guild,
      "notifications"
    );

    for (const id in guildSettings) {
      const channelSettings = guildSettings[id];

      if (
        member.guild.channels.has(id) &&
        channelSettings[1] === true &&
        member.guild.channels
          .get(id)
          .permissionsFor(member.guild.me)
          .has("SEND_MESSAGES")
      ) {
        // The channel in the database exists on the server and permissions to send messages are there
        announceGuildMemberLeave(member.guild.channels.get(id), member);
      } else {
        // Missing permissions so remove this channel from the provider
        channelSettings[1] = false;
        guildSettings[id] = channelSettings;
        client.provider.set(member.guild, "notifications", guildSettings);
      }
    }
  })
  .on("guildBanAdd", async (guild, user) => {
    const guildSettings = await client.provider.get(guild, "notifications");

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
        client.provider.set(guild, "notifications", guildSettings);
      }
    }
  })
  .on("guildBanRemove", async (guild, user) => {
    const guildSettings = await client.provider.get(guild, "notifications");

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
        announceGuildBanRemove(guild.channels.get(id), user);
      } else {
        // Missing permissions so remove this channel from the provider
        channelSettings[0] = false;
        guildSettings[id] = channelSettings;
        client.provider.set(guild, "notifications", guildSettings);
      }
    }
  })
  .on("voiceStateUpdate", async (oldVoiceState, newVoiceState) => {
    const guildSettings = await client.provider.get(
      newVoiceState.guild,
      "notifications"
    );

    for (const id in guildSettings) {
      const channelSettings = guildSettings[id];

      if (
        newVoiceState.guild.channels.has(id) &&
        channelSettings[2] === true &&
        newVoiceState.guild.channels
          .get(id)
          .permissionsFor(newVoiceState.guild.me)
          .has("SEND_MESSAGES")
      ) {
        // The channel in the database exists on the server and permissions to send messages are there
        if (oldVoiceState.channel || newVoiceState.channel) {
          announceVoiceChannelUpdate(
            newVoiceState.guild.channels.get(id),
            oldVoiceState,
            newVoiceState
          );
        }
      } else {
        // Missing permissions so remove this channel from the provider
        channelSettings[2] = false;
        guildSettings[id] = channelSettings;
        client.provider.set(
          newVoiceState.guild,
          "notifications",
          guildSettings
        );
      }
    }
  })
  .on("guildMemberUpdate", async (oldMember, newMember) => {
    const guildSettings = await client.provider.get(
      newMember.guild,
      "notifications"
    );

    for (const id in guildSettings) {
      const channelSettings = guildSettings[id];

      if (
        newMember.guild.channels.has(id) &&
        channelSettings[3] === true &&
        newMember.guild.channels
          .get(id)
          .permissionsFor(newMember.guild.me)
          .has("SEND_MESSAGES")
      ) {
        // The channel in the database exists on the server and permissions to send messages are there
        if (oldMember && newMember) {
          announceGuildMemberUpdate(
            newMember.guild.channels.get(id),
            oldMember,
            newMember
          );
        }
      } else {
        // Missing permissions so remove this channel from the provider
        channelSettings[3] = false;
        guildSettings[id] = channelSettings;
        client.provider.set(newMember.guild, "notifications", guildSettings);
      }
    }
  })
  .on("messageDelete", async msg => {
    const guildSettings = await client.provider.get(msg.guild, "notifications");
    const channels = [];

    for (const id in guildSettings) {
      const channelSettings = guildSettings[id];

      if (
        msg.guild.channels.has(id) &&
        channelSettings[5] === true &&
        msg.guild.channels
          .get(id)
          .permissionsFor(msg.guild.me)
          .has("SEND_MESSAGES")
      ) {
        // The channel in the database exists on the server and permissions to send messages are there
        channels.push(msg.guild.channels.get(id));
      } else {
        // Missing permissions so remove this channel from the provider
        channelSettings[5] = false;
        guildSettings[id] = channelSettings;
        client.provider.set(msg.guild, "notifications", guildSettings);
      }
    }

    if (channels.length > 0) {
      const embed = new MessageEmbed({
        title: "Message deleted",
        color: 0xf44336,
        timestamp: new Date(),
        footer: {
          text: `Message content is hidden to protect ${
            msg.author.tag
          }'s privacy`
        },
        author: {
          name: `${msg.author.tag} (${msg.author.id})`,
          // eslint-disable-next-line camelcase
          icon_url: msg.author.displayAvatarURL(128)
        },
        fields: [
          {
            name: "Channel",
            value: msg.channel.toString()
          }
        ]
      });

      channels.forEach(channel => channel.send(embed));
    }
  })
  .on("messageUpdate", async (oldMsg, newMsg) => {
    const guildSettings = await client.provider.get(
      newMsg.guild,
      "notifications"
    );
    const channels = [];

    for (const id in guildSettings) {
      const channelSettings = guildSettings[id];
      if (
        newMsg.guild.channels.has(id) &&
        channelSettings[6] === true &&
        newMsg.guild.channels
          .get(id)
          .permissionsFor(newMsg.guild.me)
          .has("SEND_MESSAGES")
      ) {
        // The channel in the database exists on the server and permissions to send messages are there
        channels.push(newMsg.guild.channels.get(id));
      } else {
        // Missing permissions so remove this channel from the provider
        channelSettings[6] = false;
        guildSettings[id] = channelSettings;
        client.provider.set(newMsg.guild, "notifications", guildSettings);
      }
    }

    if (
      channels.length > 0 &&
      newMsg.editedAt &&
      (oldMsg.content !== newMsg.content ||
        oldMsg.embeds.length !== newMsg.embeds.length)
    ) {
      const embed = new MessageEmbed({
        title: `Message edited (${newMsg.id})`,
        color: 0xff9800,
        timestamp: newMsg.editedAt,
        footer: {
          text: `Message history is hidden to protect ${
            newMsg.author.tag
          }'s privacy`
        },
        author: {
          name: `${newMsg.author.tag} (${newMsg.author.id})`,
          // eslint-disable-next-line camelcase
          icon_url: newMsg.author.displayAvatarURL(128)
        },
        fields: [
          {
            name: "Channel",
            value: newMsg.channel.toString()
          },
          {
            name: "Message",
            value: `[Jump to](https://discordapp.com/channels/${
              newMsg.guild.id
            }/${newMsg.channel.id}/${newMsg.id})`
          }
        ]
      });

      channels.forEach(channel => channel.send(embed));
    }
  })
  .on("commandBlocked", async (msg, reason) => {
    client.stats.increment("bot.commands.blocked");
    const userBalance = await database.balances.get(msg.author.id);

    const houseBalance = await database.balances.get(client.user.id);

    keenClient.recordEvent("blockedCommands", {
      author: msg.author,
      reason,
      timestamp: msg.createdAt,
      message: msg.content,
      userBalance,
      houseBalance
    });
  })
  .on("commandRun", async (cmd, promise, msg, args) => {
    client.stats.increment("bot.commands.run");
    const commandLogger = logger.scope(`shard ${client.shard.id}`, "command");
    const userBalance = await database.balances.get(msg.author.id);
    const houseBalance = await database.balances.get(client.user.id);

    const logOptions = {
      prefix: `${msg.author.tag} (${msg.author.id})`,
      message: `${cmd.group.name}:${cmd.memberName}`,
      suffix: args ? JSON.stringify(args) : null
    };

    keenClient.recordEvent("commands", {
      author: {
        id: msg.author.id,
        tag: msg.author.tag
      },
      timestamp: msg.createdAt,
      message: msg.content,
      args,
      command: { group: { name: cmd.group.name }, name: cmd.name },

      userBalance,
      houseBalance
    });

    commandLogger.command(logOptions);
  })
  .on("message", msg => {
    /* Protecting bot token */
    const warning = `TOKEN COMPROMISED, REGENERATE IMMEDIATELY!\n
		https://discordapp.com/developers/applications/me/${client.user.id}\n`;

    if (msg.content.includes(config.discordToken) && msg.deletable) {
      // Message can be deleted, so delete it
      msg.delete().then(() => {
        logger.critical(`${warning}
				Bot token found and deleted in message by ${msg.author.tag} (${
          msg.author.id
        }).\n
				Message: ${msg.content}`);
      });
    } else if (msg.content.includes(config.discordToken) && !msg.deletable) {
      // Message can't be deleted

      logger.critical(`${warning}
			Bot token found in message by ${msg.author.tag} (${msg.author.id}).\n
			Message: ${msg.content}`);
    }
  });

// Log in the bot
logger.time("login");
client.login(config.discordToken);
