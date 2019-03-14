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
require("sqreen");
const { BaseCluster } = require("kurasuta");
const { FriendlyError } = require("discord.js-commando");
const { WebhookClient } = require("discord.js");
const path = require("path");
const KeyvProvider = require("commando-provider-keyv");
const Keyv = require("keyv");
const database = require("./util/database");
const axios = require("axios");
const sentry = require("@sentry/node");
const config = require("./config");
const schedule = require("node-schedule");
const { Batch } = require("reported");
const stripWebhookURL = require("./util/stripWebhookURL");
const packageData = require("../package");
const ms = require("ms");

// Notification handlers
const announceUserAccountBirthday = require("./notificationHandlers/userAccountBirthday");

// Use Sentry
if (config.sentryDSN) {
  sentry.init({
    dsn: config.sentryDSN,
    release: packageData.version,
    environment: process.env.NODE_ENV || "development"
  });
}

// Store settings (like a server prefix) in a Keyv instance
const copy = data => data;
const keyv = new Keyv(config.backend, {
  ttl: ms("1 year"),
  serialize: copy,
  deserialize: copy,
  collection: "settings"
});

module.exports = class DiceCluster extends BaseCluster {
  constructor(parameters) {
    super(parameters);

    // Get the loggers running with accurate scopes
    this.logger = require("./util/logger").scope(`shard ${this.client.shard.id}`);
    this.webhookLogger = this.logger.scope(`shard ${this.client.shard.id}`, "webhook");
  }
  /**
   * @name reportError
   * @param {Error} err The error that occured
   */
  reportError(err) {
    // Log the error
    this.logger.error(err);
    // Log the error on Sentry
    sentry.captureException(err);
  }

  /**
   * @name reportPromiseRejection
   * @param {Error} reason The error that occured
   * @param {Promise} promise The error that occured
   */
  reportPromiseRejection(reason, promise) {
    // Log the error and promise
    this.logger.error(reason, "at the promise", promise);
    // Log the error on Sentry
    sentry.captureException(reason);
  }

  configureRegistry(registry) {
    registry
      // Command argument types
      .registerDefaultTypes()

      // Command groups
      .registerDefaultGroups()

      // Default commands except the help command
      .registerDefaultCommands({
        help: false,
        unknownCommand: false
      })

      // Register custom argument types in the ./types directory
      .registerTypesIn(path.join(__dirname, "types"))

      // Registers your custom command groups
      .registerGroups([
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

      // Registers all of the commands in the ./commands directory
      .registerCommandsIn(path.join(__dirname, "commands"));
  }

  scheduleBirthdayNotifications() {
    const userAccountBirthdayLogger = this.logger.scope(`shard ${this.client.shard.id}`, "user account birthday");
    // Every day at 00:10:00 UTC
    schedule.scheduleJob("10 0 * * *", () => {
      // Find a list of users whose accounts were made on this day of this month
      const now = new Date();
      userAccountBirthdayLogger.debug("It's currently", now);
      this.client.guilds.filter(guild =>
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
              message: "Passed verification, their birthday is on this day of this month and they are human"
            });

            this.client.provider.get(member.guild, "notifications").then(guildSettings => {
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
                  announceUserAccountBirthday(member.guild.channels.get(id), member.user);
                } else {
                  // Missing permissions so remove this channel from the provider
                  channelSettings[4] = false;
                  guildSettings[id] = channelSettings;
                  this.client.provider.set(member.guild, "notifications", guildSettings);
                }
              }
            });
          })
      );
    });
  }

  launch() {
    this.configureRegistry(this.client.registry);

    this.scheduleBirthdayNotifications();

    this.client.setProvider(new KeyvProvider(keyv)).then(async () => {
      const blacklist = await this.client.provider.get("global", "blacklist", []);
      this.client.blacklist = blacklist;
    });

    this.client.dispatcher.addInhibitor(msg => {
      const { blacklist } = this.client;

      if (blacklist.includes(msg.author.id)) {
        return ["blacklisted", msg.reply(`You have been blacklisted from ${this.client.user.username}.`)];
      }
      return false;
    });

    this.client
      .on("debug", (...toLog) => {
        if (process.env.NODE_ENV === "development") {
          this.logger.scope(`shard ${this.client.shard.id}`, "discord.js").debug(...toLog);
        }
      })
      .on("unhandledRejection", this.reportPromiseRejection)
      .on("error", this.reportError)
      .on("rejectionHandled", this.reportPromiseRejection)
      .on("uncaughtException", this.reportError)
      .on("warning", warning => {
        this.logger.warn(warning);
        sentry.captureException(warning);
      })
      .on("commandError", (command, error) => {
        if (error instanceof FriendlyError) return;
        sentry.captureException(error);
        this.logger.error(error);
      })
      .on("ready", () => {
        this.logger.timeEnd("login");
        this.logger.info(`Logged in as ${this.client.user.tag}!`);

        // Set game presence to the help command once loaded
        this.client.user.setActivity("for @Dice help", { type: "WATCHING" });

        // Only check for Discoin transactions and send bot stats if this is shard 0 and the production account
        if (this.client.shard.id === 0 && config.clientID === this.client.user.id) {
          const botListLogger = this.logger.scope("bot list logger");

          const batchBotList = new Batch(config.botListTokens, this.client.user.id);
          batchBotList.on("status", (botList, token) => {
            botListLogger.debug("About to send stats for:", botList);
            botListLogger.debug(`Token for ${botList}:`, token);
          });

          const submitToBotLists = async () => {
            botListLogger.start("Sending stats to bot lists");
            const shards = await this.client.shard.broadcastEval("this.guilds.size");
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

          schedule.scheduleJob("/5 * * * *", this.checkDiscoinTransactions);
        }
      })
      .on("guildMemberAdd", require("./events/guildMemberAdd"))
      .on("guildMemberRemove", require("./events/guildMemberRemove"))
      .on("guildBanAdd", require("./events/guildBanAdd"))
      .on("guildBanRemove", require("./events/guildBanRemove"))
      .on("voiceStateUpdate", require("./events/voiceStateUpdate"))
      .on("guildMemberUpdate", require("./events/guildMemberUpdate"))
      .on("messageDelete", require("./events/messageDelete"))
      .on("messageUpdate", require("./events/messageUpdate"))
      .on("commandBlocked", require("./events/commandBlocked"))
      .on("commandRun", require("./events/commandRun"));

    // Log in the bot
    this.logger.time("login");
    this.client.login(config.discordToken).catch(this.logger.error);
  }

  async checkDiscoinTransactions() {
    const checkDiscoinTransactionsLogger = this.logger.scope(`shard ${this.client.shard.id}`, "discoin");
    const transactions = (await axios
      .get("http://discoin.sidetrip.xyz/transactions", { headers: { Authorization: config.discoinToken } })
      .catch(error => checkDiscoinTransactionsLogger.error(error))).data;

    checkDiscoinTransactionsLogger.debug("All Discoin transactions:", JSON.stringify(transactions));

    for (const transaction of transactions) {
      if (transaction.type !== "refund") {
        checkDiscoinTransactionsLogger.debug("Discoin transaction fetched:", JSON.stringify(transaction));
        database.balances.increase(transaction.user, transaction.amount);

        if (config.webhooks.discoin) {
          const webhookData = stripWebhookURL(config.webhooks.discoin);
          const webhook = new WebhookClient(webhookData.id, webhookData.token);

          // eslint-disable-next-line no-await-in-loop
          const user = await this.client.users.fetch(transaction.user);

          webhook
            .send({
              embeds: [
                {
                  title: "Discoin Conversion Received",
                  author: {
                    name: `${user.tag} (${user.id})`,
                    url: "https://discordapp.com",
                    iconURL: user.displayAvatarURL(128)
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
            .then(() => this.webhookLogger.debug("Sent Discoin webhook"))
            .catch(this.webhookLogger.error);
        }
      }
    }
  }
};
