const KeenTracking = require("keen-tracking");
const config = require("../config");

const keenClient = new KeenTracking({
  projectId: config.keen.projectID,
  writeKey: config.keen.writeKey
});

module.exports = async (cmd, promise, msg, args) => {
  const { client } = msg;
  const database = require("../util/database");
  const logger = require("../util/logger").scope(`shard ${client.shard.id}`);

  client.stats.increment("bot.commands.run");
  const commandLogger = logger.scope(`shard ${client.shard.id}`, "command");
  const userBalance = await database.balances.get(msg.author.id);
  const houseBalance = await database.balances.get(client.user.id);

  const logOptions = {
    prefix: `${msg.author.tag} (${msg.author.id}) ${cmd.group.name}:${
      cmd.memberName
    }`,
    message: args || null
  };

  keenClient.recordEvent("commands", {
    author: {
      id: msg.author.id,
      tag: msg.author.tag
    },
    timestamp: msg.createdAt,
    message: msg.content,
    args,
    command: { group: { name: cmd.group.name }, name: cmd.name },

    userBalance,
    houseBalance
  });

  commandLogger.command(logOptions);
};
