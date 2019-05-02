/*
Copyright 2019 Jonah Snider

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

module.exports = class ClapCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "clap",
      group: "fun",
      memberName: "clap",
      description: "Have the bot say a phrase you specify.",
      examples: ["clap do you are have stupid"],
      args: [
        {
          key: "phrase",
          prompt: "What do you want to have clappified?",
          type: "string",
          parse: (val, msg) => Util.cleanContent(val, msg)
        }
      ],
      throttling: {
        usages: 2,
        duration: 6
      }
    });
  }

  exec(msg, { phrase }) {
    return msg.say(phrase.split(" ").join("👏"));
  }
};
