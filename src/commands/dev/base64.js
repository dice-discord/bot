/*
Copyright 2018 Jonah Snider

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

const SentryCommand = require("../../structures/SentryCommand");
const { Util } = require("discord.js");
const modes = ["encode", "decode"];

/**
 * @param {string} text Text to encode or decode
 * @param {string} mode Mode for conversion
 * @returns {string} Converted text
 */
const convert = (text, mode) => {
  if (mode === "encode") {
    return Buffer.from(text).toString("base64");
  } else if (mode === "decode") {
    return Buffer.from(text, "base64").toString("utf8");
  }
  return "Unknown mode";
};

module.exports = class Base64Command extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "base64",
      aliases: ["base-64"],
      group: "dev",
      memberName: "base64",
      description: "Converts text to and from Base64 encoding.",
      details: "**Modes**: `encode` or `decode`",
      args: [
        {
          key: "mode",
          prompt: "Do you want to `encode` or `decode`?",
          type: "string",
          oneOf: modes,
          parse: mode => mode.toLowerCase()
        },
        {
          key: "text",
          prompt: "What text do you want to convert to Base64?",
          type: "string",
          parse: value => Util.escapeMarkdown(value)
        }
      ]
    });
  }

  run(msg, { mode, text }) {
    return msg.reply(convert(text, mode), { split: true });
  }
};
