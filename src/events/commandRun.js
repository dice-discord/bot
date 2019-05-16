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

module.exports = (cmd, promise, msg, args) => {
  const { client } = msg;
  const logger = require("../util/logger").scope(`shard ${client.shard.id}`);

  client.stats.increment("bot.commands.run");
  const commandLogger = logger.scope(`shard ${client.shard.id}`, "command");

  const logOptions = {
    prefix: `${msg.author.tag} (${msg.author.id}) ${cmd.group.id}:${cmd.memberName}`,
    message: args || null
  };

  commandLogger.command(logOptions);
};
