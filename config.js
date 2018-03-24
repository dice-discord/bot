module.exports = {
	minMultiplier: 1.01,
	maxMultiplier: 100,
	minWager: 1,
	currency: {
		plural: 'oats',
		singular: 'oat'
	},
	newUserBalance: 500,
	houseStartingBalance: 750000,
	houseEdgePercentage: 1,
	clientID: '388191157869477888',
	homeServerID: '388366947689168897',
	notifications: [{
		label: 'ban and unban',
		name: 'banUnban'
	}, {
		label: 'member join and leave',
		name: 'guildMemberJoinLeave'
	}, {
		label: 'voice channel',
		name: 'voiceChannel'
	}, {
		label: 'nickname change',
		name: 'guildMemberUpdate'
	}],
	discoinCurrencyCodes: ['dts', 'elt', 'kek', 'rbn', 'sbt'],

	channels: {
		commandLogs: '399458745480118272',
		errors: '411563928816975883'
	},

	/* eslint-disable no-process-env */
	mongoDBURI: process.env.MONGODB_URI,
	botToken: process.env.BOT_TOKEN,
	keen: {
		projectID: process.env.KEEN_PROJECTID,
		writeKey: process.env.KEEN_WRITEKEY
	},
	fortniteTrackerNetworkToken: process.env.FORTNITETN_TOKEN,
	discoinToken: process.env.DISCOIN_TOKEN,

	discordBotsListToken: process.env.DISCORDBOTSORG_TOKEN,
	botsForDiscordToken: process.env.BOTSFORDISCORD_TOKEN,
	discordBotsToken: process.env.BOTSDISCORDPW_TOKEN,
	discordBotsAtTerminalInk: process.env.LSTERMINALINK_TOKEN
	/* eslint-enable no-process-env */
};
