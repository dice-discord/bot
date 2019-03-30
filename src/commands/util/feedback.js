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
const logger = require("../../util/logger").scope("command", "feedback");

module.exports = class FeedbackCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "feedback",
      aliases: ["bug-report", "feed-back", "suggest", "suggestion"],
      group: "util",
      memberName: "feedback",
      description: "Submit bugs and suggestions to the developer.",
      examples: ["feedback When I use `$$dice` the bot lags."],
      args: [
        {
          key: "userFeedback",
          label: "feedback",
          prompt: "What is your feedback you want to report?",
          type: "string"
        }
      ],
      throttling: {
        usages: 2,
        duration: 60
      }
    });
  }

  run(msg, { userFeedback }) {
    const message = "Thanks for sending your feedback.";
    const messages = [];
    if (userFeedback.toLowerCase().includes("help") || userFeedback.toLowerCase().includes("support")) {
      messages.push(msg.reply(`${message} If you need help with a problem use ${msg.anyUsage("support")}.`));
    } else {
      messages.push(msg.reply(message));
    }

    logger.debug("About to send MessageEmbed");

    // Pizza Fox#0075
    const developer = this.client.users.resolve("210024244766179329");

    messages.push(
      developer.send({
        embed: {
          author: {
            name: `${msg.author.tag} (${msg.author.id})`,
            iconURL: msg.author.displayAvatarURL(128)
          },
          timestamp: new Date(msg.createdTimestamp),
          fields: [
            {
              name: "Message",
              value: userFeedback
            }
          ]
        }
      })
    );

    return messages;
  }
};
