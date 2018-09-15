// Copyright Jonah Snider 2018

const config = JSON.parse(process.env.CONFIG_JSON);
config.env = process.env.NODE_ENV;

module.exports = config;
