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
const parseColor = require("parse-color");

module.exports = class ColorCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "color",
      aliases: ["rgb", "cmyk", "hsv", "hsl", "hex", "hexadecimal", "colors"],
      group: "dev",
      memberName: "color",
      description: "Display and convert a color.",
      details: "Display and convert a color from and to hexadecimal, HSL, RGB, CMYK, and CSS name",
      examples: ["color blue", "color #deaded", "color hsl(210,50,50)"],
      clientPermissions: ["EMBED_LINKS"],
      args: [
        {
          key: "color",
          prompt: "What color do you want to get information on?",
          type: "string"
        }
      ],
      throttling: {
        usages: 2,
        duration: 60
      }
    });
  }

  exec(msg, { color }) {
    try {
      msg.channel.startTyping();

      if (!color.startsWith("#") && color.length === 6) {
        // Hexadecimal missing the pound sign
        const testResult = parseColor(`#${color}`);
        if (!testResult.cmyk || !testResult.rgb || !testResult.hsv || !testResult.hsl || !testResult.hex) {
          // Invalid hexadecimal
          return msg.reply("Invalid color.");
        }
        // Valid hexadecimal, missing pound sign
        color = testResult;
      } else {
        // Other color type
        color = parseColor(color);
      }

      if (!color.cmyk || !color.rgb || !color.hsv || !color.hsl || !color.hex) {
        return msg.reply("Invalid color.");
      }

      return msg.replyEmbed({
        color: Util.resolveColor(color.rgb),
        thumbnail: {
          url: `https://api.terminal.ink/colour?color=${color.hex.substring(1)}`
        },
        fields: [
          {
            name: "CSS Keyword",
            value: color.keyword || "None"
          },
          {
            name: "Hexadecimal",
            value: color.hex.toString()
          },
          {
            name: "CMYK",
            value: color.cmyk.join(", ")
          },
          {
            name: "HSL",
            value: color.hsl.join(", ")
          },
          {
            name: "HSV",
            value: color.hsv.join(", ")
          },
          {
            name: "RGB",
            value: color.rgb.join(", ")
          }
        ]
      });
    } finally {
      msg.channel.stopTyping();
    }
  }
};
