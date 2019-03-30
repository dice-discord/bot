const SentryCommand = require("../../structures/SentryCommand");

module.exports = class UnknownCommandResponseCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "unknown-command-response",
      group: "util",
      memberName: "unknown-command-response",
      description: "Enable or disable unknown command responses.",
      details: "If no setting is provided, the current setting will be shown.",
      examples: ["unknown-command-response on"],
      aliases: [
        "unknown-response",
        "unknown-cmd-response",
        "unknown-command-respond",
        "unknown-respond",
        "unknown-cmd-respond",
        "set-unknown-command-response",
        "set-unknown-response",
        "set-unknown-cmd-response",
        "set-unknown-command-respond",
        "set-unknown-respond",
        "set-unknown-cmd-respond"
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

  async exec(msg, { updated }) {
    const old = await this.client.provider.get(msg.guild, "unknownCommandResponse", false);

    if (typeof updated === "boolean") {
      await this.client.provider.set(msg.guild, "unknownCommandResponse", updated);

      return msg.reply(`Set the unknown command response setting to ${updated ? "" : "not"} respond`);
    } else {
      return msg.reply(`Current setting is to ${old ? "" : "not "}respond.`);
    }
  }
};
