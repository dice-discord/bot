import SingleResponseCommand from '../../structures/SingleResponseCommand';

export default class SupportCommand extends SingleResponseCommand {
	constructor() {
		super('invite', {
			description: 'An invite link to add Dice to a server.',
			response: 'https://dice.js.org/invite'
		});
	}
}
