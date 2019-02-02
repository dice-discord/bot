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
const rebootLogger = logger.scope("shard manager", "daily reboot");
const { ShardingManager, Util } = require("discord.js");
const packageData = require("../package");
const config = require("./config");
const sentry = require("@sentry/node");
const { join } = require("path");
const schedule = require("node-schedule");

logger.note(`Node.js version: ${process.version}`);
logger.note(`Dice version v${packageData.version}`);

if (config.sentryDSN) {
  sentry.init({
    dsn: config.sentryDSN,
    release: packageData.version,
    environment: process.env.NODE_ENV || "development"
  });
}

const manager = new ShardingManager(join(__dirname, "dice.js"), {
  respawn: process.env.NODE_ENV === "production"
});

manager.on("shardCreate", shard => logger.start("Launched shard", shard.id));

Util.fetchRecommendedShards(config.discordToken)
  .then(recommended => {
    // Use one extra shard to help with sudden increases to server count
    manager.spawn(recommended + 1).catch(logger.error);
  })
  .catch(logger.error);

schedule.scheduleJob("10 0 * * *", () => {
  manager.shards.forEach(async shard => {
    rebootLogger.await(`Respawning shard #${shard.id}`);
    await shard.respawn();
    rebootLogger.complete(`Respawned shard #${shard.id}`);
  });
});
