const SentryCommand = require("../../structures/SentryCommand");

module.exports = class UnknownCommandCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "unknown-command",
      group: "util",
      memberName: "unknown-command",
      description: "Displays help information for when an unknown command is used.",
      examples: ["unknown-command kick-everybody-ever"],
      unknown: true,
      hidden: true,
      argsType: "single"
    });
  }

  async exec(msg, args) {
    if (msg.guild) {
      const tags = await this.client.provider.get(msg.guild, "tags");

      if (
        msg.content.split(msg.guild.commandPrefix)[1] !== "undefined" &&
        typeof tags !== "undefined" &&
        tags.hasOwnProperty(args.toLowerCase())
      ) {
        this.client.registry.resolveCommand("tags:get").exec(msg, { name: args });
        return null;
      }
    }

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
