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

const { Command } = require("discord.js-commando");
const { Util } = require("discord.js");

module.exports = class ChooseCommand extends Command {
  constructor(client) {
    super(client, {
      name: "choose",
      aliases: ["select", "pick"],
      group: "util",
      memberName: "choose",
      description: "Choose an item from a list you provide.",
      examples: ["choose red blue yellow green", 'choose "play PUBG" "play Fortnite" "delete System32"'],
      args: [
        {
          key: "options",
          prompt: "What do you want to select?",
          type: "string",
          parse: value => Util.escapeMarkdown(value),
          infinite: true
        }
      ],
      throttling: {
        usages: 2,
        duration: 6
      }
    });
  }

  run(msg, { options }) {
    // Argument checking
    if (options.length < 2) return msg.reply("Please provide 2 or more options.");

    const randomNumber = Math.floor(Math.random() * (options.length - 0) + 0);

    return msg.reply(`I choose #${randomNumber + 1}, ${options[randomNumber]}.`);
  }
};
