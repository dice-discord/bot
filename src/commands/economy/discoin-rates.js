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
const { MessageEmbed } = require("discord.js");
const logger = require("../../util/logger").scope("command", "discoin rates");
const { stripIndents } = require("common-tags");
const Discoin = require("@discoin/scambio").default;

module.exports = class DiscoinRatesCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "discoin-rates",
      group: "economy",
      memberName: "discoin-rates",
      description: "Lists the conversion rates for Discoin currencies.",
      aliases: ["rates", "conversion-rates", "convert-rates"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 10
      }
    });
  }

  async exec(msg) {
    try {
      msg.channel.startTyping();

      const currencies = await Discoin.currencies.getMany();

      const embed = new MessageEmbed({
        title: "Discoin Conversion Rates",
        url: "https://dash.discoin.zws.im/#/currencies"
      });

      const oatsCurrency = currencies.find(currency => currency.id === "OAT");

      currencies.forEach(currency => {
        embed.addField(
          currency.name,
          stripIndents`
            Currency code: ${currency.id}
            Value in Discoin D$: ${currency.value.toLocaleString()}
            Value in oats: ${(currency.value / oatsCurrency.value).toLocaleString()}`,
          true
        );
      });

      return msg.replyEmbed(embed);
    } catch (error) {
      logger.error(error);
      return msg.reply("An error occured.");
    } finally {
      msg.channel.stopTyping();
    }
  }
};
