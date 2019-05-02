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

module.exports = class LMGTFYCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "lmgtfy",
      group: "search",
      memberName: "lmgtfy",
      description: "Generate a let-me-Google-that-for-you link.",
      examples: ["lmgtfy dice discord bot"],
      aliases: ["let-me-google-that-for-you"],
      throttling: {
        usages: 2,
        duration: 6
      },
      args: [
        {
          key: "query",
          prompt: "What do you want the link to search for?",
          type: "string",
          max: 500,
          parse: value => encodeURIComponent(value)
        }
      ]
    });
  }

  exec(msg, { query }) {
    return msg.reply(`https://lmgtfy.com/?iie=1&q=${query}`);
  }
};
