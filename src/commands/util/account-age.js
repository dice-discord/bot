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

const { formatDistance, formatRelative } = require("date-fns");
const SentryCommand = require("../../structures/SentryCommand");
const { stripIndents } = require("common-tags");

module.exports = class AccountAgeCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "account-age",
      group: "util",
      memberName: "account-age",
      description: "Check when an account was created.",
      aliases: ["age", "account-created"],
      examples: ["account-age", "account-age @Dice"],
      args: [
        {
          key: "user",
          prompt: "Who do you want to check?",
          type: "user",
          default: ""
        }
      ],
      throttling: {
        usages: 2,
        duration: 4
      }
    });
  }

  exec(msg, { user }) {
    const target = user || msg.author;
    const { createdAt } = target;
    return msg.reply(stripIndents`${formatDistance(createdAt, new Date())} old.
    Created on ${formatRelative(createdAt, new Date())}.`);
  }
};
