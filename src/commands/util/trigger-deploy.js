const { exec } = require('child-process-promise');
const { Command } = require('discord.js-commando');

const command = 'bash ./gcloud/post-receive.sh';

module.exports = class TriggerDeployCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'trigger-deploy',
      group: 'util',
      memberName: 'trigger-deploy',
      description: 'Run the deploy script.',
      details: 'Only the bot owner(s) may use this command.',
      ownerOnly: true,
      aliases: ['deploy']
    });
  }

  run() {
    exec(command);
  }
};
