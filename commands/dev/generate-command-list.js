// Copyright 2018 Jonah Snider

const { Command } = require('discord.js-commando');
const replaceAll = require('replaceall');

module.exports = class GenerateCommandListCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'generate-command-list',
      group: 'dev',
      memberName: 'generate-command-list',
      description: 'Creates a Markdown table of all commands.',
      details: 'Only the bot owner(s) may use this command.',
      aliases: [
        'command-list',
        'cmd-list',
        'make-command-list',
        'make-cmd-list',
        'gen-cmd-list',
        'gen-command-list',
        'generate-cmd-list'
      ],
      throttling: {
        usages: 2,
        duration: 15
      },
      ownerOnly: true
    });
  }

  run(msg) {
    const { groups } = this.client.registry;

    msg.say(groups.filter(grp => grp.commands)
      // eslint-disable-next-line max-len
      .map(grp => `${grp.commands.filter(cmd => !cmd.ownerOnly).map(cmd => `|[\\\`${cmd.name}\\\`](/commands/${replaceAll(' ', '-', cmd.group.name.toLowerCase())}/${cmd.name})|${cmd.description}|${cmd.group.name}|`).join('\n')}`), { split: true });
  }
};
