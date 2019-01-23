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

module.exports = class RollDieCommand extends Command {
  constructor(client) {
    super(client, {
      name: "roll-die",
      aliases: ["roll-dice", "die", "dice"],
      group: "fun",
      memberName: "roll-die",
      description: "Roll a die.",
      examples: ["roll-die", "roll-die 20"],
      args: [
        {
          key: "sides",
          prompt: "How many sides do you want your die to have?",
          type: "integer",
          label: "number of die sides",
          default: 6,
          min: 1
        }
      ],
      throttling: {
        usages: 2,
        duration: 6
      }
    });
  }

  run(msg, { sides }) {
    const randomNumber = Math.floor(Math.random() * sides) + 1;

    return msg.reply(`🎲 You rolled a ${randomNumber}.`, { split: true });
  }
};
