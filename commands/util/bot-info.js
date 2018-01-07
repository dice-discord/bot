const rules = require('../../rules');
const {
    Command,
} = require('discord.js-commando');

module.exports = class BotInfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'bot-info',
            group: 'util',
            memberName: 'bot-info',
            description: `Information about <@${rules.houseID}>`,
            examples: ['bot-info'],
        });
    }

    run(msg) {
        return msg.reply({
            'embed': {
                'title': 'Dice',
                'color': 0x4caf50,
                'description': `${this.client.user} was made by <@210024244766179329> based off the game [bustadice](https://bustadice.com)`,
                'thumbnail': {
                    'url': 'https://cdn.discordapp.com/avatars/388191157869477888/6433e08d1796afb6efa1d37f8619f635.webp',
                },
            },
        });
    }
};