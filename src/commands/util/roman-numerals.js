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
const romanize = require("romanize");

module.exports = class RomanNumeralsCommand extends Command {
  constructor(client) {
    super(client, {
      name: "roman-numerals",
      aliases: ["roman", "roman-numeral"],
      group: "util",
      memberName: "roman-numerals",
      description: "Converts numbers to and from roman numerals.",
      args: [
        {
          key: "number",
          prompt: "What number do you want to translate?",
          type: "romannumerals|integer",
          min: 1
        }
      ]
    });
  }

  run(msg, { number }) {
    if (number === parseInt(number, 10)) {
      return msg.reply(romanize(number));
    }

    const back = value => {
      let result = 0;

      const decimal = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
      const roman = [
        "M",
        "CM",
        "D",
        "CD",
        "C",
        "XC",
        "L",
        "XL",
        "X",
        "IX",
        "V",
        "IV",
        "I"
      ];
      for (let i = 0; i <= decimal.length; i++) {
        while (value.indexOf(roman[i]) === 0) {
          result += decimal[i];
          value = value.replace(roman[i], "");
        }
      }
      return result;
    };

    return msg.reply(back(number));
  }
};
