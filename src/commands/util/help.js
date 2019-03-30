const { stripIndents, oneLine } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const { util } = require("discord.js-commando");
const SentryCommand = require("../../structures/SentryCommand");
const { disambiguation } = util;
const genCmdURL = require("../../util/genCmdURL");

module.exports = class HelpCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "help",
      group: "util",
      memberName: "help",
      aliases: ["commands"],
      description: "Displays a list of available commands, or detailed information for a specified command.",
      details: oneLine`
				The command may be part of a command name or a whole command name.
				If it isn't specified, all available commands will be listed.
			`,
      examples: ["help", "help prefix"],
      guarded: true,
      args: [
        {
          key: "command",
          prompt: "Which command would you like to view the help for?",
          type: "string",
          default: ""
        }
      ]
    });
  }

  async run(msg, args) {
    const { groups } = this.client.registry;
    const commands = this.client.registry.findCommands(args.command, false, msg);
    const showAll = args.command && args.command.toLowerCase() === "all";
    if (args.command && !showAll) {
      if (commands.length === 1) {
        const [command] = commands;
        const guildOnly = command.guildOnly ? " (Usable only in servers)" : "";
        const nsfw = command.nsfw ? " (NSFW)" : "";

        const embed = new MessageEmbed({
          title: `${command.name}${guildOnly}${nsfw}`,
          description: command.description,
          url: `https://dice.js.org${genCmdURL(command)}`,
          fields: [
            {
              name: "Format",
              value: `${msg.anyUsage(`${command.name}${command.format ? ` ${command.format}` : ""}`)}`
            },
            {
              name: "Group",
              value: `${commands[0].group.name} (\`${commands[0].groupID}:${commands[0].memberName}\`)`
            }
          ]
        });

        if (command.aliases.length > 0) {
          const prettyAliases = command.aliases.map(alias => `\`${alias}\``);
          embed.addField("Aliases", prettyAliases.join(", "));
        }

        if (command.details) {
          embed.addField("Details", command.details);
        }

        if (command.examples) {
          const prettyExamples = command.examples.map(example => `\`${example}\``);
          embed.addField("Examples", prettyExamples.join("\n"));
        }

        const messages = [];
        try {
          messages.push(await msg.replyEmbed(embed));
        } catch (err) {
          messages.push(await msg.reply("An unknown error occured when sending the help message."));
        }
        return messages;
      } else if (commands.length > 15) {
        return msg.reply("Multiple commands found. Please be more specific.");
      } else if (commands.length > 1) {
        return msg.reply(disambiguation(commands, "commands"));
      } else {
        return msg.reply(
          `Unable to identify command. Use ${msg.usage(
            null,
            msg.channel.type === "dm" ? null : undefined,
            msg.channel.type === "dm" ? null : undefined
          )} to view the list of all commands.`
        );
      }
    } else {
      const messages = [];
      try {
        messages.push(
          await msg.direct(
            stripIndents`
					${oneLine`
						To run a command in ${msg.guild ? msg.guild.name : "any server"},
						use ${Command.usage("command", msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
						For example, ${Command.usage("prefix", msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
					`}
					To run a command in this DM, simply use ${Command.usage("command", null, null)} with no prefix.

					Use ${this.usage("<command>", null, null)} to view detailed information about a specific command.
					Use ${this.usage("all", null, null)} to view a list of *all* commands, not just available ones.

					__**${showAll ? "All commands" : `Available commands in ${msg.guild || "this DM"}`}**__

					${groups
            .filter(grp => grp.commands.some(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg))))
            .map(
              grp => stripIndents`
							__${grp.name}__
							${grp.commands
                .filter(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg)))
                .map(cmd => `**${cmd.name}:** ${cmd.description}${cmd.nsfw ? " (NSFW)" : ""}`)
                .join("\n")}`
            )
            .join("\n\n")}
				`,
            { split: true }
          )
        );
        if (msg.channel.type !== "dm") messages.push(await msg.reply("Sent you a DM with information."));
      } catch (err) {
        messages.push(await msg.reply("Unable to send you the help DM. You probably have DMs disabled."));
      }
      return messages;
    }
  }
};
