/**
 * Gets the ID and token for a webhook from a webhook URL from the Discord client
 * @param {string} url URL for the webhook from the Discord client
 * @returns {Object} Object with the webhook ID and token
 */
module.exports = url => {
  const regex = /https:\/\/discordapp\.com\/api\/webhooks\/(\d{1,})\/([\w-_]{1,})/;
  const matches = regex.exec(url);

  return { id: matches[1], token: matches[2] };
};
