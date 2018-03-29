title: Self hosting Guide
description: Instructions on self hosting Dice

# Self hosting guide

!!! warning
    Dice is not optimized for self hosting. Many features will not work out-of-the-box because of built-in values

## Guide

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/PizzaFox/dice/tree/master/)

### Overview

Dice is made with [Node.js](https://nodejs.org/en/about/), [Discord.js](https://discord.js.org/#/), and [Discord.js Commando](https://github.com/discordjs/Commando/blob/master/README.md). It uses a [MongoDB](https://www.mongodb.com/what-is-mongodb) instance to store balances and settings and [Keen](https://keen.io) for statistics.

### Installation

1. Download [Node.js](https://nodejs.org/en/download/)
2. Install [Yarn](https://yarnpkg.com/en/docs/install)
3. Download [Dice's source code from GitHub](https://github.com/PizzaFox/dice)
4. Run `yarn install`

### Configuring environment variables

!!! note "Third party APIs"
    Dice uses the Fortnite Tracker API, the Discord Bot List API, the Bots for Discord API, Keen, Sentry, the botlist.space API and the Discord Bots API. All these services require an API key to function properly.

| Name                                                                      | Key                    | Example value                                                                                                                                                                                      |
|---------------------------------------------------------------------------|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Bot token](https://discordapp.com/developers/applications/me)            | `BOT_TOKEN`            | `NDA0MDUxNjM2MDU1NDQxNDA4.DYtHvQ.k4kZ75iLsOlco4e1mQAU0jyn17E`                                                                                                                                      |
| [Discord Bot List token](https://discordbots.org/api/docs#mybots)         | `DISCORDBOTSORG_TOKEN` | `@^8rdS40aO9Y74SlkIp2&9iFn77os%pSp7U1F3UvC59GD1NW%OX#w2uF2M64y7^08L95nqVi7#2k^RU2P9q13m71BM0H0r9%9nV^@^8rdS40aO9Y74SlkIp2&9iFn77os%pSp7U1F3UvC59GD1NW%OX#w2uF2M64`                                 |
| [Fortnite Tracker API token](https://fortnitetracker.com/site-api/create) | `FORTNITETN_TOKEN`     | `ma6066n1tvzv51a221xt1ajr-ffz1-ouwp-s65p-87-6v97p9944yv5axoo851w6rh1ut`                                                                                                                            |
| [Discord Bots token](https://bots.discord.pw/api)                         | `BOTSDISCORDPW_TOKEN`  | `760Q&dy3gu50&0&AwKAaM7E3Z6NV^WhTB#1FN9IQWFUo5jiPcK*3r%4M9^00bGc8V3zb78u2$3855AXt2O#88Xebh392S!6Ng6Cbj6E6I6CT1FmT81ZNE32OACZg&vMEf83683ix381TH$Z42wxI1#7F333ssnN9`                                 |
| [botlist.space token](https://botlist.space)                              | `BOTLISTSPACE_TOKEN`   | `526a7qgzq4fm913q33955v31842262s0212b79f63mpsal578xmj2ujk7740j2h186pp30ikm43zf53o901aszg9472yh95tpu43zgoeukgho4v86irfu8bjfiuefk1h`                                                                 |
| [MongoDB](https://docs.mongodb.com/manual/installation/) URI              | `MONGODB_URI`          | `mongodb://dicediscordbot:NV^WhTB#1FN9IQWFUo5ji@127.0.0.1:27017`                                                                                                                                   |
| [Keen](https://keen.io) project ID                                        | `KEEN_PROJECTID`       | `em35pb5qfjezh6m0p5h3fpee`                                                                                                                                                                         |
| [Keen](https://keen.io) write key                                         | `KEEN_WRITEKEY`        | `U1ER0DLXA16E7LHQIBWLNVTABL03YP2FVG6RO24IXRUICPU8UE8Y37XK8BJXYC47FXD45HKPF74Y20MDXHETAPUZDW6SA4V2QY0Z8Y37XK8BJXYC47FXD45HKPF74Y20MDXHETAPUZDW6SA4V2QY0ZU9TSYDWQGDUADQS9L480ZQXFE1ULIWRON60SJOLT0K` |
| [Discoin](https://discoin.gitbooks.io/docs/content/) token                | `DISCOIN_TOKEN`        | `yGwq56qrcqdrUSfrGWvX4WEBnEFceFomX3ZTzHot5roE3DH1F8`                                                                                                                                               |
| [Sentry](https://sentry.io) URI                                           | `SENTRY_URI`           | `https://m422i071y2um6884xn1y2yh3d3213mg6:2319dm9231hn114lo4289w94869t239t@sentry.io/689054`                                                                                                       |

### Running the bot

`yarn start` or `node index.js`
