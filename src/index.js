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

require("dotenv").config();
const logger = require("./util/logger").scope("shard manager");
const { ShardingManager } = require("kurasuta");
const DiceClient = require("./structures/DiceClient");
const packageData = require("../package");
const config = require("./config");
const sentry = require("@sentry/node");
const { join } = require("path");
const stripWebhookURL = require("./util/stripWebhookURL");
const { WebhookClient } = require("discord.js");

logger.note(`Node.js version: ${process.version}`);
logger.note(`Dice version v${packageData.version}`);

if (config.sentryDSN) {
  sentry.init({
    dsn: config.sentryDSN,
    release: packageData.version,
    environment: process.env.NODE_ENV || "development"
  });
}

const sharder = new ShardingManager(join(__dirname, "dice"), {
  token: config.discordToken,
  respawn: process.env.NODE_ENV === "production",
  development: process.env.NODE_ENV === "development",
  client: DiceClient,
  clientOptions: {
    commandPrefix: config.commandPrefix,
    owner: config.owners,
    disableEveryone: true
  }
});

sharder.on("debug", logger.debug);

sharder
  .spawn()
  .then(() => {
    logger.success("Clusters spawned");

    // Announce version being ready
    if (config.webhooks.updates && process.env.NODE_ENV === "production") {
      const webhookData = stripWebhookURL(config.webhooks.updates);
      const webhook = new WebhookClient(webhookData.id, webhookData.token);

      webhook
        .send({
          embeds: [
            {
              color: 0x4caf50,
              title: `${this.client.user.username} Ready`,
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
        .then(() => this.webhookLogger.debug("Sent ready webhook"))
        .catch(this.webhookLogger.error);
    }
  })
  .catch(err => {
    logger.fatal("An error occured when spawning clusters");
    logger.error(err);
  });
