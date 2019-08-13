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

const util = require("util");
const discord = require("discord.js");
const tags = require("common-tags");
const { sensitivePattern } = require("../../util/sensitivePattern");
const { exec } = require("child-process-promise");
const SentryCommand = require("../../structures/SentryCommand");

const nl = "\n";
const nlPattern = new RegExp(nl, "g");

module.exports = class ExecuteCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "execute",
      group: "util",
      memberName: "execute",
      description: "Executes a command in the console.",
      details: "Only the bot owner(s) may use this command.",
      ownerOnly: true,
      aliases: ["exec"],
      args: [
        {
          key: "command",
          prompt: "What command would you like to execute?",
          type: "string"
        }
      ]
    });

    this.lastResult = null;
  }

  async exec(msg, args) {
    // Run the code and measure its execution time
    let hrDiff;
    try {
      const hrStart = process.hrtime();
      this.lastResult = (await exec(args.command)).stdout;
      hrDiff = process.hrtime(hrStart);
    } catch (err) {
      const clean = discord.Util.escapeMarkdown(`${err}`.replace(this.sensitivePattern, "--snip--"));

      return msg.reply(`Error while executing: \`${clean}\``, { split: true });
    }

    // Prepare for callback time and respond
    this.hrStart = process.hrtime();
    const result = this.makeResultMessages(this.lastResult, hrDiff, args.command);
    if (Array.isArray(result)) {
      return result.map(item => msg.reply(item, { split: true }));
    } else {
      return msg.reply(result, { split: true });
    }
  }

  makeResultMessages(result, hrDiff, input = null) {
    const inspected = util
      .inspect(result, { depth: 0 })
      .replace(nlPattern, "\n")
      .replace(this.sensitivePattern, "--snip--");
    const split = inspected.split("\n");
    const last = inspected.length - 1;
    const prependPart = inspected[0] !== "{" && inspected[0] !== "[" && inspected[0] !== "'" ? split[0] : inspected[0];
    const appendPart =
      inspected[last] !== "}" && inspected[last] !== "]" && inspected[last] !== "'"
        ? split[split.length - 1]
        : inspected[last];
    const prepend = `\`\`\`bash\n${prependPart}\n`;
    const append = `\n${appendPart}\n\`\`\``;
    if (input) {
      return discord.splitMessage(
        tags.stripIndents`
				*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ""}${hrDiff[1] / 1000000}ms.*
				\`\`\`bash
				${discord.Util.escapeMarkdown(inspected)}
				\`\`\`
			`,
        { maxLength: 1900, prepend, append }
      );
    } else {
      return discord.splitMessage(
        tags.stripIndents`
				*Callback executed after ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ""}${hrDiff[1] / 1000000}ms.*
				\`\`\`bash
				${inspected}
				\`\`\`
			`,
        { maxLength: 1900, prepend, append }
      );
    }
  }

  get sensitivePattern() {
    return sensitivePattern;
  }
};
