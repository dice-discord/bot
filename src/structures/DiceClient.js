const { CommandoClient } = require('discord.js-commando');
const database = require('../util/database');
const StatsD = require('hot-shots');

class DiceClient extends CommandoClient {
  constructor(options) {
    super(options);

    this.db = database;
    this.blacklist = [];
    this.stats = new StatsD();
  }
}

module.exports = DiceClient;
