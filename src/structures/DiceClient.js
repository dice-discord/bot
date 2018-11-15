const { CommandoClient } = require('discord.js-commando');
const database = require('../util/database');
const StatsD = require('hot-shots');
const logger = require('../util/logger');

class DiceClient extends CommandoClient {
  constructor(options) {
    super(options);

    this.db = database;
    this.blacklist = [];
    this.stats = new StatsD();

    this.stats.socket.on('error', error => {
      logger.error('Error in socket: ', error);
    });
  }
}

module.exports = DiceClient;
