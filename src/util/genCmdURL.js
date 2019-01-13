module.exports = cmd =>
  `/commands/${cmd.group.name.toLowerCase().replace(/\s/g, "-")}/${cmd.name}`;
