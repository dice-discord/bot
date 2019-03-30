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

module.exports = class RussianRouletteCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "russian-roulette",
      group: "games",
      memberName: "russian-roulette",
      description: "Play a game of Russian roulette.",
      throttling: {
        usages: 1,
        duration: 2
      }
    });
  }

  exec(msg) {
    // Round numbers
    const randomNumber = Math.floor(Math.random() * 6);

    if (randomNumber === 0) {
      return msg.reply("💥 *Bang.* You lose.");
    }

    return msg.reply("🔫 *Click.* You survived.");
  }
};
