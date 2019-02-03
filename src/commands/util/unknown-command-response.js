const { Command } = require("discord.js-commando");

module.exports = class UnknownCommandResponseCommand extends Command {
  constructor(client) {
    super(client, {
      name: "unknown-command-response",
      group: "util",
      memberName: "unknown-command-response",
      description: "Set the unknown command response setting.",
      details: "If no setting is provided, the current setting will be shown.",
      examples: ["unknown-command-response on"],
      aliases: [
        "unknown-response",
        "unknown-cmd-response",
        "unknown-command-respond",
        "unknown-respond",
        "unknown-cmd-respond"
      ],
      args: [
        {
          key: "updated",
          label: "setting",
          prompt: "Do you want to enable the unknown command response?",
          type: "boolean",
          default: ""
        }
      ]
    });
  }

  async run(msg, { updated }) {
    const old = await this.client.provider.get(
      msg.guild,
      "unknownCommandResponse",
      false
    );

    if (typeof updated === "boolean") {
      await this.client.provider.set(
        msg.guild,
        "unknownCommandResponse",
        updated
      );

      return msg.reply(
        `Set the unknown command response setting to ${
          updated ? "" : "not"
        } respond`
      );
    } else {
      return msg.reply(`Current setting is to ${old ? "" : "not "}respond.`);
    }
  }
};
