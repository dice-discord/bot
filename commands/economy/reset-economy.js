const {
    Command
} = require("discord.js-commando");
const diceAPI = require("../../diceAPI");

module.exports = class ResetEconomyCommand extends Command {
    constructor(client) {
        super(client, {
            name: "reset-economy",
            group: "economy",
            memberName: "reset-economy",
            description: "Reset the entire economy",
            details: "Only the bot owner(s) may use this command.",
            aliases: ["reset", "reset-eco", "destroy", "destroy-eco", "destroy-economy", "burn"],
            examples: ["reset-economy"],
            throttling: {
                usages: 2,
                duration: 30
            }
        });
    }

    run(msg) {
        // Permission checking
        if (msg.author.isOwner === false) {
            return msg.reply("❌ You must be an owner to use this command.");
        }

        // Start resetting the economy
        msg.reply("💣 Resetting the economy.");
        diceAPI.resetEconomy().then(() => {
            // Once the promise is fulfilled (when it's finished) respond to the user that it's done
            return msg.reply("🔥 Finished resetting the economy.");
        });
    }
};