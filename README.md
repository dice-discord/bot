# Dice

![Status](https://discordbots.org/api/widget/status/388191157869477888.png)

[![Known Vulnerabilities](https://snyk.io/test/github/dice-discord/bot/badge.svg?targetFile=package.json)](https://snyk.io/test/github/dice-discord/bot?targetFile=package.json)

A general purpose utility bot, with an economy, games, and lots of other features.

## [Invite to Your Server](https://dice.js.org/invite)

## Features

- Moderators can disable commands on their server
- `99.9%` uptime
- Utility (account age, choose, random dog/cat image)
- Economy (transfer, dailies, games, leaderboard)
- Games (Fortnite stats, Overwatch stats, betting game, russian roulette)
- Moderation (ban, hackban, bulk delete messages, selfroles, unban)
- Customizable prefix

## Detailed Status

[![Discord Bots](https://discordbots.org/api/widget/388191157869477888.svg)](https://discordbots.org/bot/388191157869477888)

## Contributing

Basically all contributions to Dice are welcome. Clone the repository and make a pull request or contact a maintainer with change requests.

### Docker

#### Editing

When a commit is made Docker Hub automatically builds the image to `dice-discord/bot`. The officially hosted version of Dice auto updates to `dice-discord/bot` every 5 minutes.

#### Running

Dice ideally is run on a server with at least 2GB of RAM that is dedicated to Dice. Every 5 minutes it downloads and runs the latest version of the image provided. Run the following command when in a directory with the `docker-compose.yml` file. Make sure you fill out the environment variables in a `.env` file. An example of one can be found in the `.env.example` file.

```bash
docker-compose up
```

> Copyright 2018 Jonah Snider
>
> Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
> You may obtain a copy of the License at
>
> [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)
>
> Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
