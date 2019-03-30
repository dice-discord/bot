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
const { stripIndents } = require("common-tags");
const Roll = require("roll");
const staticRoll = new Roll();

module.exports = class RollDieCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "roll-die",
      aliases: ["roll-dice", "die", "dice", "roll"],
      group: "fun",
      memberName: "roll-die",
      description: "Roll a die with dice notation.",
      details: stripIndents`
      **Roll a single die**: \`d6\` (rolls a 6 sided die)
      **Roll several dice**: \`4d6\` (rolls 4 \`d6\`s)
      **Roll several sets of dice**: \`2d20+1d12\` (rolls 2 \`d20\`s and 1 \`d12\`)
      **Roll a percentage**: \`d%\` (same as \`d100\`)
      **Simple calculations**: \`2d6+2\` (add, subtract, multiply, or divide)
      `,
      examples: ["roll-die", "roll-die d20"],
      args: [
        {
          key: "roll",
          prompt: "What do you want to roll?",
          type: "string",
          default: "d6",
          validate: val => staticRoll.validate(val)
        }
      ],
      throttling: {
        usages: 2,
        duration: 6
      }
    });
  }

  run(msg, { roll }) {
    // Give it a pseudo-random seed for a bit more entropy
    const rolled = new Roll(Math.random).roll(roll);

    return msg.reply(`You rolled ${rolled.result}${rolled.rolled.length > 1 ? `(${rolled.rolled.join(", ")})` : ""}.`);
  }
};
