# Dice

![Status](https://discordbots.org/api/widget/status/388191157869477888.png) [![Deploy to Heroku](https://img.shields.io/badge/deploy%20to-heroku-7056bf.svg)](https://heroku.com/deploy?template=https://github.com/pizzafox/dice/tree/master)

A general purpose utility bot, with an economy, games, and lots of other features.

## [Invite to Your Server](https://discordapp.com/oauth2/authorize?client_id=388191157869477888&permissions=8&scope=bot)

## Features

* Moderators can disable commands on their server
* `99.9%` uptime
* Utility (account age, choose, random dog/cat image)
* Economy (transfer, dailies, games, leaderboard)
* Games (Fortnite stats, Overwatch stats, betting game, russian roulette)
* Moderation (ban, hackban, bulk delete messages, selfroles, unban)
* Customizable prefix

## Detailed Status

[![Discord Bots](https://discordbots.org/api/widget/388191157869477888.svg)](https://discordbots.org/bot/388191157869477888)

## Contributing

Basically all contributions to Dice are welcome. Clone the repository and make a pull request or contact a maintainer with change requests.

### Docker

#### Editing

Since Dice is containerized, making changes to the source code should be pushed to the Docker repository (`pizzafox/dice`). Once you have made changes, you must do the following instructions:

Note: These instructions assume you are in the Dice source code folder and the [Docker](https://docker.io) daemon is running. Replace "latest" with a specific version (found in `package.json`) if you would like.

```bash
# Build the Docker container
docker build -t pizzafox/dice:latest .
# Push the container to the Docker repository
docker push pizzafox/dice:latest
```

#### Running

Dice ideally is run on a server with at least 2GB of RAM that is dedicated to Dice. Run the following command when in a directory with a `docker-compose.yml` file. An example of a file can be found in `example-docker-compose.yml`.

```bash
docker-compose up
```

> Copyright 2018 Jonah Snider
