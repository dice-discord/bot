/*
Copyright 2018 Jonah Snider

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const SentryCommand = require("../../structures/SentryCommand");

module.exports = class GetMinecraftHeadCommand extends SentryCommand {
  constructor(client) {
    super(client, {
      name: "get-minecraft-head",
      group: "minecraft",
      memberName: "get-head",
      description: "Shows an isometric view of a Minecraft user's head.",
      aliases: ["get-mc-head", "mc-head"],
      examples: ["get-minecraft-head Notch"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 3
      },
      args: [
        {
          key: "username",
          prompt: "What user do you want to look up?",
          type: "string"
        }
      ]
    });
  }

  exec(msg, { username }) {
    return msg.reply({
      embed: {
        author: {
          name: username,
          iconURL: `https://minotar.net/helm/${encodeURIComponent(username)}`
        },
        image: {
          url: `https://minotar.net/cube/${encodeURIComponent(username)}/100.png`
        }
      }
    });
  }
};
