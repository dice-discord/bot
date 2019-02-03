const KeenTracking = require("keen-tracking");
const config = require("../config");

const keenClient = new KeenTracking({
  projectId: config.keen.projectID,
  writeKey: config.keen.writeKey
});

module.exports = async (msg, reason) => {
  const { client } = msg;
  const database = require("../util/database");

  client.stats.increment("bot.commands.blocked");
  const userBalance = await database.balances.get(msg.author.id);

  const houseBalance = await database.balances.get(client.user.id);

  keenClient.recordEvent("blockedCommands", {
    author: msg.author,
    reason,
    timestamp: msg.createdAt,
    message: msg.content,
    userBalance,
    houseBalance
  });
};
