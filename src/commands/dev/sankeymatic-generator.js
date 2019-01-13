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

module.exports = class SankeyMATICGeneratorCommand extends Command {
  constructor(client) {
    super(client, {
      name: "sankeymatic-generator",
      group: "dev",
      memberName: "sankeymatic-generator",
      description:
        "Creates code for a SankeyMATIC diagram display server counts for each shard.",
      details: "Only the bot owner(s) may use this command.",
      aliases: ["sankeymatic", "sankey", "flow-chart"],
      throttling: {
        usages: 2,
        duration: 15
      },
      ownerOnly: true
    });
  }

  async run(msg) {
    const serverCounts = await this.client.shard.fetchClientValues(
      "guilds.size"
    );
    let result = "";

    serverCounts.forEach(shardServerCount => {
      result += `Shard ${serverCounts.indexOf(
        shardServerCount
      )} [${shardServerCount}] Server Count\n`;
    });

    return msg.say(result, { split: true });
  }
};
