import {codeblock} from 'discord-md-tags';
import {Message, User} from 'discord.js';
import {DiceCommand, DiceCommandCategories} from '../../structures/DiceCommand';
import {typeName as anyUser} from '../../types/anyUser';

export default class HelloJsCommand extends DiceCommand {
	constructor() {
		super('hello-js', {
			aliases: ['hello-script', 'hello-javascript', 'js-hello', 'javascript-hello'],
			category: DiceCommandCategories.Developer,
			description: {
				content: 'Generate a JavaScript program to say hello to someone.',
				usage: '[user]',
				examples: ['', 'Dice', '@Dice', '388191157869477888']
			},
			args: [
				{
					id: 'user',
					match: 'content',
					type: anyUser,
					prompt: {
						start: 'Who would you like to generate the script for?',
						retry: 'Invalid user, please try again'
					}
				}
			]
		});
	}

	async exec(message: Message, {user}: {user: User}): Promise<Message | undefined> {
		return message.util?.send(codeblock('javascript')`
const ${user.username} = client.users.cache.get("${user.id}");
const filter = m => m.author.id === "${user.id}";
${user.username}.send("how are you");
message.channel.awaitMessages(filter, { max: 3, time: 200000}).then(collected => {
if(collected.first().content.toLowerCase() === "can i help you?") {
msg.channel.send("i just asked").then(() => {
const options = [0, 1];
const option = options[Math.floor(Math.random() * options.length)];

my.luck( if option === 1 ? "${message.author.username}.noBlock() : "${message.author.username}.block())
})
}
})`);
	}
}
