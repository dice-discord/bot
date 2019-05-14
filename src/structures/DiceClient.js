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

const { CommandoClient } = require("discord.js-commando");
const database = require("../util/database");
const StatsD = require("hot-shots");
const logger = require("../util/logger");
const config = require("../config");

class DiceClient extends CommandoClient {
  constructor(options) {
    super(options);

    this.db = database;
    this.blacklist = [];
    this.stats = new StatsD({
      protocol: "udp",
      errorHandler: logger.scope("statsd").error
    });
    this.config = config;

    this.stats.socket.on("error", error => {
      logger.error("Error in socket: ", error);
    });
  }
}

module.exports = DiceClient;
