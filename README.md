# Dice

[![Build Status](https://github.com/dice-discord/bot/workflows/CI/badge.svg)](https://github.com/dice-discord/bot/actions)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)
[![codecov](https://codecov.io/gh/dice-discord/bot/branch/master/graph/badge.svg)](https://codecov.io/gh/dice-discord/bot)

A total rewrite of the [Dice Discord bot](https://github.com/dice-discord/bot) in TypeScript using the [Akairo framework](https://discord-akairo.github.io/#/).

## Developers

### File naming scheme

#### Commands

Commands should be under their category's subfolder (ex. `commands/admin` for the `admin` category).

Command filenames should exactly match their ID.

#### Listeners

Commands should be under their category's subfolder (ex. `listeners/client` for the `client` category).
The category should exactly match their emitter name.

Listener filenames should exactly match their event name (ex. `commandStarted.ts` for the `commandStarted` event).

#### Inhibitors

Inhibitor filenames should exactly match their ID.

### Prequisites

This project uses [Node.js](https://nodejs.org) 12 to run.

This project uses [Yarn](https://yarnpkg.com) to install dependencies, although you can use another package manager like [npm](https://www.npmjs.com) or [pnpm](https://pnpm.js.org).

```sh
yarn install
# or `npm install`
# or `pnpm install`
```

### Building

Run the `build` script to compile the TypeScript into the `tsc_output` folder.
This will compile the `src` and the `test` directory, so be careful not to upload the whole folder as a published package.

### Style

This project uses [Prettier](https://prettier.io) and [XO](https://github.com/xojs/xo).

You can run Prettier in the project with this command:

```sh
yarn run style
```

You can run XO with this command:

```sh
yarn run lint
```

Note that XO will also error if you have TypeScript errors, not just if your formatting is incorrect.

### Linting

This project uses [XO](https://github.com/xojs/xo) (which uses [ESLint](https://eslint.org) and some plugins internally) to perform static analysis on the TypeScript.
It reports things like unused variables or not following code conventions.

```sh
yarn run lint
```

Note that XO will also error if you have incorrect formatting, not just if your TypeScript code has errors.
