const util = require("util");
const discord = require("discord.js");
const tags = require("common-tags");
const { sensitivePattern } = require("../../util/sensitivePattern");
const SentryCommand = require("../../structures/SentryCommand");

const nl = "!!NL!!";
const nlPattern = new RegExp(nl, "g");

module.exports = class EvalOnAllShardsCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "eval-on-all-shards",
      aliases: ["shard-eval", "shards-eval", "eval-on-shards", "eval-all-shards"],
      group: "util",
      memberName: "eval-on-all-shards",
      description: "Executes JavaScript code on all shards.",
      details: "Only the bot owner(s) may use this command.",
      ownerOnly: true,

      args: [
        {
          key: "script",
          prompt: "What code would you like to evaluate?",
          type: "string"
        }
      ]
    });

    this.lastResult = null;
  }

  async exec(msg, args) {
    // Make a bunch of helpers
    /* eslint-disable no-unused-vars */
    const message = msg;
    const { client } = msg;
    const objects = client.registry.evalObjects;
    const { lastResult } = this;
    const doReply = val => {
      if (val instanceof Error) {
        msg.reply(`Callback error: \`${val}\``);
      } else {
        const result = this.makeResultMessages(val, process.hrtime(this.hrStart));
        if (Array.isArray(result)) {
          for (const item of result) msg.reply(item);
        } else {
          msg.reply(result);
        }
      }
    };
    /* eslint-enable no-unused-vars */

    // Run the code and measure its execution time
    let hrDiff;
    try {
      const hrStart = process.hrtime();
      this.lastResult = await client.shard.broadcastEval(args.script);
      hrDiff = process.hrtime(hrStart);
    } catch (err) {
      return msg.reply(`Error while evaluating: \`${err}\``);
    }

    // Prepare for callback time and respond
    this.hrStart = process.hrtime();
    return msg.reply(this.makeResultMessages(this.lastResult, hrDiff, args.script));
  }

  makeResultMessages(result, hrDiff, input = null) {
    const inspected = util
      .inspect(result, { depth: 0 })
      .replace(nlPattern, "\n")
      .replace(sensitivePattern, "--snip--");
    const split = inspected.split("\n");
    const last = inspected.length - 1;
    const prependPart = inspected[0] !== "{" && inspected[0] !== "[" && inspected[0] !== "'" ? split[0] : inspected[0];
    const appendPart =
      inspected[last] !== "}" && inspected[last] !== "]" && inspected[last] !== "'"
        ? split[split.length - 1]
        : inspected[last];
    const prepend = `\`\`\`javascript\n${prependPart}\n`;
    const append = `\n${appendPart}\n\`\`\``;
    if (input) {
      return discord.splitMessage(
        tags.stripIndents`
				*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ""}${hrDiff[1] / 1000000}ms.*
				\`\`\`javascript
				${inspected}
				\`\`\`
			`,
        1900,
        "\n",
        prepend,
        append
      );
    }
    return discord.splitMessage(
      tags.stripIndents`
				*Callback executed after ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ""}${hrDiff[1] / 1000000}ms.*
				\`\`\`javascript
				${inspected}
				\`\`\`
			`,
      1900,
      "\n",
      prepend,
      append
    );
  }
};
