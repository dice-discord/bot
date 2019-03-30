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
const { MessageEmbed } = require("discord.js");
const config = require("../../config");
const simpleFormat = require("../../util/simpleFormat");
const winPercentage = require("../../util/winPercentage");

module.exports = class SimulateGameCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "simulate-game",
      group: "games",
      memberName: "simulate-game",
      description: "Simulate a round of the betting game.",
      aliases: ["practice-game", "sim-game", "simulate-dice", "sim-dice"],
      examples: ["simulate-game 250 4", "sim 23-game 2.01"],
      clientPermissions: ["EMBED_LINKS"],
      args: [
        {
          key: "wager",
          prompt: "How much do you want to wager? (whole number)",
          type: "integer",
          min: config.minCurrency
        },
        {
          key: "multiplier",
          prompt: "How much do you want to multiply your wager by?",
          type: "float",
          // Round multiplier to second decimal place
          parse: multiplier => simpleFormat(multiplier),
          min: config.minMultiplier,
          max: config.maxMultiplier
        }
      ],
      throttling: {
        usages: 2,
        duration: 1
      }
    });
  }

  exec(msg, { wager, multiplier }) {
    // Round numbers to second decimal place
    const randomNumber = simpleFormat(Math.random() * config.maxMultiplier);

    // Get boolean if the random number is greater than the multiplier
    const gameResult = randomNumber > winPercentage(multiplier, msg.author);

    const embed = new MessageEmbed({
      title: `**${wager} 🇽 ${multiplier}**`,
      fields: [
        {
          name: "🔢 Random Number Result",
          value: randomNumber.toString(),
          inline: true
        },
        {
          name: "📊 Win Chance",
          value: `${simpleFormat(winPercentage(multiplier, msg.author))}%`,
          inline: true
        },
        {
          name: "💵 Wager",
          value: wager.toString().toLocaleString(),
          inline: true
        },
        {
          name: "🇽 Multiplier",
          value: multiplier.toString(),
          inline: true
        }
      ]
    });

    if (gameResult) {
      // Red color and loss message
      embed.setColor(0xf44334);
      embed.setDescription(`You would have lost \`${wager.toLocaleString()}\` ${config.currency.plural}.`);
    } else {
      // Green color and win message
      embed.setColor(0x4caf50);
      embed.setDescription(
        `Your profit would have been \`${simpleFormat(wager * multiplier - wager).toLocaleString()}\` ${
          config.currency.plural
        }!`
      );
    }

    return msg.replyEmbed(embed);
  }
};
