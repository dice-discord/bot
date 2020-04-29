import SingleResponseCommand from '../../structures/SingleResponseCommand';

export default class VoteCommand extends SingleResponseCommand {
	constructor() {
		super('vote', {
			aliases: ['voting'],
			description: 'Get a link to vote on Top.gg and get extra oats.',
			response: 'https://top.gg/bot/388191157869477888/vote'
		});
	}
}
