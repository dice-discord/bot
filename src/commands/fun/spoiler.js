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

module.exports = class SpoilerCommand extends Command {
  constructor(client) {
    super(client, {
      name: "spoiler",
      group: "fun",
      memberName: "spoiler",
      description: "Say a phrase with every character as a ||spoiler||.",
      aliases: ["spoiler-say", "say-spoiler"],
      examples: ["spoiler"],
      args: [
        {
          key: "phrase",
          prompt: "What do you want to have said?",
          type: "string"
        }
      ],
      throttling: {
        usages: 2,
        duration: 6
      }
    });
  }

  run(msg, { phrase }) {
    return msg.say(phrase.replace(/./g, "||$&||"));
  }
};
