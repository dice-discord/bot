import SingleResponseCommand from '../../structures/SingleResponseCommand';

export default class SupportCommand extends SingleResponseCommand {
	constructor() {
		super('support', {
			aliases: ['home', 'report', 'bug'],
			description: 'An invite to the Dice server.',
			response: 'https://dice.js.org/server'
		});
	}
}
