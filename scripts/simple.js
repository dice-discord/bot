// Put your token here:
// It should look something like this:
const token = "mfa.RZ7ZFgfBwZ9ISK-lwLhVDLAMQVkIWTTq-AdyVY-iR82XLx-pxAMhJ0zPldq6x7JyHK1Qc_vJAtVr8Nj4O7BH";

const Discord = require("discord.js");

// Default starting balance
let balance = 100;
let channel;
// Create an instance of a Discord client
const client = new Discord.Client();
client.on("ready", () => {
    function play() {
        channel.send(`$play ${balance} 1.01`);
        // Calculate new balance if you won (doesn't check if you lost)
        balance = balance * 1.01;
        console.log("Finished game! New balance: " + balance);
    }
    console.log("I am ready!");
    // Find game channel
    channel = client.channels.find("id", "389228857602867220");
    // Every second, play a non risky game with entire balance
    setInterval(play, 2000);
});

// Log in account
client.login(token);