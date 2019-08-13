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

// Set up dependencies
require("sqreen");

const packageData = require("../package");
let logger = require("./util/logger");

if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  const profiler = require("@google-cloud/profiler");

  logger.pending("Starting Stackdriver Profiler");
  profiler.start({
    projectID: "dice-discord",
    serviceContext: {
      service: "shard",
      version: packageData.version
    }
  });
}

const { BaseCluster } = require("kurasuta");
const { FriendlyError } = require("discord.js-commando");
const { WebhookClient } = require("discord.js");
const path = require("path");
const KeyvProvider = require("commando-provider-keyv");
const Keyv = require("keyv");
const database = require("./util/database");
const axios = require("axios");
const Sentry = require("@sentry/node");
const config = require("./config");
const schedule = require("node-schedule");
const { Batch } = require("reported");
const stripWebhookURL = require("./util/stripWebhookURL");
const ms = require("ms");

const DBL = require("dblapi.js");
const dbl = new DBL(config.botListTokens.discordBotList, {
  webhookPort: 5000
});

let webhookLogger;

// Notification handlers
const announceUserAccountBirthday = require("./notificationHandlers/userAccountBirthday");

// Use Sentry
if (config.sentryDSN) {
  Sentry.init({
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
  constructor(shardingManager) {
    super(shardingManager);

    // Get the loggers running with accurate scopes
    logger = logger.scope(`shard ${this.client.shard.id}`);
    webhookLogger = logger.scope(`shard ${this.client.shard.id}`, "webhook");
  }

  /**
   * @name reportError
   * @param {Error} err The error that occurred
   */
  reportError(err) {
    // Log the error
    logger.error(err);
    // Log the error on Sentry
    Sentry.captureException(err);
  }

  /**
   * @name reportPromiseRejection
   * @param {Error} reason The error that occurred
   * @param {Promise} promise The error that occurred
   */
  reportPromiseRejection(reason, promise) {
    // Log the error and promise
    logger.error(reason, "at the promise", promise);
    // Log the error on Sentry
    Sentry.captureException(reason);
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
        ["tags", "Tags"],
        ["selfroles", "Selfroles"],
        ["minecraft", "Minecraft"],
        ["economy", "Economy"],
        ["dev", "Developer"]
      ])

      // Registers all of the commands in the ./commands directory
      .registerCommandsIn(path.join(__dirname, "commands"));
  }

  scheduleBirthdayNotifications() {
    const userAccountBirthdayLogger = logger.scope(`shard ${this.client.shard.id}`, "user account birthday");
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

    this.handleVotes();

    this.client
      .on("debug", (...toLog) => {
        if (process.env.NODE_ENV === "development") {
          logger.scope(`shard ${this.client.shard.id}`, "discord.js").debug(...toLog);
        }
      })
      .on("unhandledRejection", this.reportPromiseRejection)
      .on("error", this.reportError)
      .on("rejectionHandled", this.reportPromiseRejection)
      .on("uncaughtException", this.reportError)
      .on("warning", warning => {
        logger.warn(warning);
        Sentry.captureException(warning);
      })
      .on("commandError", (command, error) => {
        if (error instanceof FriendlyError) return;
        Sentry.captureException(error);
        logger.error(error);
      })
      .on("ready", () => {
        logger.timeEnd("login");
        logger.info(`Logged in as ${this.client.user.tag}!`);

        // Set game presence to the help command once loaded
        this.client.user.setActivity("for @Dice help", { type: "WATCHING" });

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

        // Only check for Discoin transactions and send bot stats if this is shard 0 and the production account
        if (this.client.shard.id === 0 && config.clientID === this.client.user.id) {
          logger.debug("Going to check Discoin transactions and send bot list stats");
          const botListLogger = logger.scope("bot list logger");

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

          schedule.scheduleJob("*/5 * * * *", this.checkDiscoinTransactions);
        } else {
          logger.debug("Not going to check Discoin transactions and send bot list stats");
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
    logger.time("login");
    this.client.login(config.discordToken).catch(logger.error);
  }

  async checkDiscoinTransactions() {
    const checkDiscoinTransactionsLogger = logger.scope("discoin");

    checkDiscoinTransactionsLogger.debug("Checking Discoin transactions");

    const transactions = (await axios
      .get("http://discoin.sidetrip.xyz/transactions", { headers: { Authorization: config.discoinToken } })
      .catch(error => checkDiscoinTransactionsLogger.error(error))).data;

    checkDiscoinTransactionsLogger.debug("All Discoin transactions:", transactions);

    for (const transaction of transactions) {
      if (transaction.type !== "refund") {
        checkDiscoinTransactionsLogger.debug("Discoin transaction fetched:", transaction);
        // eslint-disable-next-line no-await-in-loop
        await database.balances.increase(transaction.user, transaction.amount);

        if (config.webhooks.discoin) {
          const webhookData = stripWebhookURL(config.webhooks.discoin);
          const webhook = new WebhookClient(webhookData.id, webhookData.token);

          // eslint-disable-next-line no-await-in-loop
          const user = await this.client.users.fetch(transaction.user);
          user.send({
            embed: {
              title: "Discoin Conversion Received",
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
          });

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
            .then(() => webhookLogger.debug("Sent Discoin webhook"))
            .catch(webhookLogger.error);
        }
      }
    }
  }

  handleVotes() {
    const voteLogger = logger.scope(`shard ${this.client.shard.id}`, "vote logger");

    dbl.webhook.on("vote", async vote => {
      const isWeekend = await dbl.isWeekend();
      const hasVoted = await dbl.hasVoted(vote.user);

      const msg = "Incorrect info received from DBL voting webhook";

      if (!hasVoted || vote.isWeekend !== isWeekend) {
        if (!hasVoted) return logger.warn(`${msg}, user did not vote`);
        if (isWeekend && !vote.isWeekend) {
          return logger.warn(`${msg}, webhook did not say it was the weekend`);
        } else if (!isWeekend && vote.isWeekend) {
          return logger.warn(`${msg}, webhook said it was the weekend`);
        }
      }

      let payout = 1000;
      if (isWeekend) payout *= 2;

      if (vote.type === "test") {
        voteLogger.debug(`Received test webhook for ${vote.user}`);
      } else {
        voteLogger.debug(`Received vote from ${vote.user} for ${payout}`);

        await Promise.all([
          this.client.users.fetch(vote.user),
          database.balances.increase(vote.user, payout),
          database.balances.increase(this.client.user.id, payout)
        ]).catch(voteLogger.error);
      }

      (await this.client.users.fetch(vote.user))
        .send({
          embed: {
            title: "Voting Reward",
            color: 0x4caf50,
            description: `Thanks for voting on Discord Bot List. You received ${payout.toLocaleString()} ${
              config.currency.plural
            }.${vote.isWeekend ? " You got double for voting during the weekend." : ""}`
          }
        })
        .then(() => voteLogger.debug(`Sent the notification message to ${vote.user}`))
        .catch(voteLogger.error);
    });
  }
};
