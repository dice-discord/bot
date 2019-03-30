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

module.exports = class AverageNumbersCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "average-numbers",
      aliases: ["average", "avg-numbers", "avg"],
      group: "util",
      memberName: "average-numbers",
      description: "Gets the average of several numbers.",
      examples: ["average 55 59 45 61", "average 5.01 1.01 -8.04 15.067"],
      args: [
        {
          key: "numbers",
          prompt: "What's another number you want to be averaged?",
          type: "float",
          label: "number",
          infinite: true
        }
      ],
      throttling: {
        usages: 2,
        duration: 6
      }
    });
  }

  run(msg, { numbers }) {
    // Argument checking
    if (numbers.length < 2) return msg.reply("Please provide 2 or more numbers.");

    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    return msg.reply(`The average is ${numbers.reduce(reducer) / numbers.length}.`);
  }
};
