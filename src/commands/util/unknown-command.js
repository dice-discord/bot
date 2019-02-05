const { Command } = require("discord.js-commando");

module.exports = class UnknownCommandCommand extends Command {
  constructor(client) {
    super(client, {
      name: "unknown-command",
      group: "util",
      memberName: "unknown-command",
      description: "Displays help information for when an unknown command is used.",
      examples: ["unknown-command kickeverybodyever"],
      unknown: true,
      hidden: true
    });
  }

  async run(msg) {
    const unknownCommandResponse = await this.client.provider.get(msg.guild, "unknownCommandResponse", false);

    if (unknownCommandResponse) {
      return msg.reply(
        `Unknown command. Use ${msg.anyUsage(
          "help",
          msg.guild ? undefined : null,
          msg.guild ? undefined : null
        )} to view the command list.`
      );
    }

    return null;
  }
};
