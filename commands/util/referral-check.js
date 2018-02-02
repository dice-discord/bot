const { Command } = require('discord.js-commando');
const rules = require('../../rules');
const winston = require('winston');

module.exports = class ReferralCheckCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'referral-check',
			group: 'util',
			memberName: 'referral-check',
			description: 'Claim referrals to get a bonus on your dailies',
			aliases: ['referral', 'ref', 'ref-check', 'invite-check', 'invitation', 'invitation-check'],
			examples: ['referral-check'],
			throttling: {
				usages: 2,
				duration: 20,
			},
			guildOnly: true,
		});
	}

	async run(msg) {
		// Guild checking
		if (msg.guild.id !== '388366947689168897') {
			return msg.reply('❌ You must be on the official server to use this command.');
		}

		// Shorten variable names
		const inviter = rules.rewardRoles[0];
		const backer = rules.rewardRoles[1];
		const recruiter = rules.rewardRoles[2];
		const affiliate = rules.rewardRoles[3];

		const invites = await msg.guild.fetchInvites();
		winston.verbose(`[COMMAND](REFFERAL-CHECK) Invites collection: ${invites}`);
		let uses = 0;
		let message;

		for (const [key, value] of invites) {
			winston.debug(`[COMMAND](REFFERAL-CHECK) Key: ${key}. Value: ${value}.`);

			// Make sure the invite was made by the message author
			if (value.inviter === msg.author) {
				winston.verbose(`[COMMAND](REFFERAL-CHECK) ${msg.author.tag} created this invite (${key})`);
				winston.verbose(`[COMMAND](REFFERAL-CHECK) value.uses: ${value.uses}`);
				uses = uses + value.uses;
			}
		}

		if (uses >= affiliate.requirement && !msg.member.roles.has(affiliate.id)) {
			msg.member.roles.add(affiliate.id, 'Invited 25+ users').then(() => {
				winston.verbose(`[COMMAND](REFFERAL-CHECK) Added affiliate role to ${msg.author.tag}`);
				msg.reply('You have been given the **affiliate** role');
			});
		} else if (uses >= recruiter.requirement && !msg.member.roles.has(recruiter.id)) {
			msg.member.roles.add(recruiter.id, 'Invited 10+ users').then(() => {
				winston.verbose(`[COMMAND](REFFERAL-CHECK) Added recruiter role to ${msg.author.tag}`);
				msg.reply('You have been given the **recruiter** role');
			});
		} else if (uses >= backer.requirement && !msg.member.roles.has(backer.id)) {
			msg.member.roles.add(backer.id, 'Invited 5+ users').then(() => {
				winston.verbose(`[COMMAND](REFFERAL-CHECK) Added backer role to ${msg.author.tag}`);
				msg.reply('You have been given the **backer** role');
			});
		} else if (uses >= inviter.requirement && !msg.member.roles.has(inviter.id)) {
			msg.member.roles.add(inviter.id, 'Invited 1+ users').then(() => {
				winston.verbose(`[COMMAND](REFFERAL-CHECK) Added inviter role to ${msg.author.tag}`);
				msg.reply('You have been given the **inviter** role');
			});
		}

		// Set custom message based on pre-existing roles
		if (msg.member.roles.has(affiliate.id) && msg.guild.id === '388366947689168897') {
			message = 'You are currently an **affiliate**.';
		} else if (msg.member.roles.has(recruiter.id) && msg.guild.id === '388366947689168897') {
			message = 'You are currently a **recruiter**.';
		} else if (msg.member.roles.has(backer.id) && msg.guild.id === '388366947689168897') {
			message = 'You are currently a **backer**.';
		} else if (msg.member.roles.has(inviter.id) && msg.guild.id === '388366947689168897') {
			message = 'You are currently an **inviter**.';
		}

		// prettier-ignore
		winston.verbose(`[COMMAND](REFFERAL-CHECK) ${msg.author.tag} has invited ${uses} people to this server.`);
		if (message) {
			return msg.reply(
				`${message}\nYou have invited ${uses} users. Please see <#397518385870667807> for information on how many invites are needed to progress to the next role.`
			);
		} else {
			return msg.reply(
				`You have invited ${uses} users. Please see <#397518385870667807> for information on how many invites are needed to progress to the next role.`
			);
		}
	}
};
