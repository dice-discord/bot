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

module.exports = class SayCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "say",
      group: "fun",
      memberName: "say",
      description: "Have the bot say a phrase you specify.",
      details: "Only the bot owner(s) may use this command",
      aliases: ["repeat"],
      examples: ["say I am a bot"],
      ownerOnly: true,
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

  exec(msg, { phrase }) {
    if (msg.deletable) msg.delete();
    return msg.say(phrase);
  }
};
