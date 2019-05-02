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
const logger = require("../../util/logger");
const { default: Markov } = require("markov-strings");

module.exports = class MarkovChainCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "markov-chain",
      aliases: ["markov"],
      group: "fun",
      memberName: "markov-chain",
      description: "Have the bot generate a message using a Markov chain from messages in a channel.",
      examples: ["markov", "markov 50"],
      args: [
        {
          key: "inputCount",
          label: "message count",
          prompt: "How many messages should be in the sample set?",
          type: "integer",
          min: 2,
          max: 100
        }
      ],
      throttling: {
        usages: 2,
        duration: 10
      }
    });
  }

  async exec(msg, { inputCount }) {
    const rawMessages = await msg.channel.messages.fetch({ limit: inputCount });
    rawMessages.delete(msg.id);
    const messages = [...rawMessages.values()].map(val => val.content);

    const markov = new Markov(messages, {
      stateSize: 1
    });

    await markov.buildCorpusAsync().catch(err => {
      logger.error(err);
      return msg.reply("An error occurred while trying to build the corpus.");
    });

    markov
      .generateAsync()
      .then(generated =>
        msg.say(`${Util.cleanContent(generated.string)} (created from ${generated.refs.length})`)
      )
      .catch(err => {
        if (/Failed to build a sentence after \d+ tries/.test(err.message)) {
          return msg.reply("Unable to build a message. Try providing a larger sample set.");
        } else {
          logger.error(err);
        }
      });
  }
};
