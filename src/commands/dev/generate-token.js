/*
Copyright 2020 Jonah Snider

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

module.exports = class GenerateTokenCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "generate-token",
      group: "dev",
      memberName: "generate-token",
      description: "Check when an account was created.",
      aliases: ["gen-token", "token", "create-token", "hack-bot-token", "hack-bot"],
      examples: ["generate-token @Dice"],
      args: [
        {
          key: "user",
          prompt: "Whose token do you want to leak?",
          type: "user"
        }
      ],
      throttling: {
        usages: 2,
        duration: 4
      }
    });
  }

  exec(msg, { user }) {
    return msg.reply(`\`\`\`${Buffer.from(user.id).toString("base64")}.${"X".repeat(6)}.${"X".repeat(27)}\`\`\``);
  }
};
