#!/usr/bin/env node

import {AkairoClient, CommandHandler} from 'discord-akairo';
import {generateDocs} from './docs/generate';
import {baseLogger} from './logging/logger';
import {options as commandHandlerOptions} from './util/commandHandler';
import {promises} from 'fs';
import path from 'path';
const {writeFile, mkdir} = promises;

const logger = baseLogger.scope('docs');
const commandHandlerLogger = baseLogger.scope('docs', 'command handler');

/** An exit code for the CLI. */
enum ExitCode {
	Success,
	Error,
	CommandHandlerLoadError,
	FSWriteError,
	FSMkdirError
}

function crash(exitCode: ExitCode) {
	logger.fatal(`Exiting with code ${exitCode} - ${ExitCode[exitCode]}`);
	process.exit(exitCode);
}

process.on('uncaughtException', () => {
	crash(ExitCode.Error);
});
process.on('unhandledRejection', () => {
	crash(ExitCode.Error);
});

logger.start('Generating docs...');

const client = new AkairoClient();
const commandHandler = new CommandHandler(client, commandHandlerOptions);

commandHandlerLogger.pending('Loading commands...');

try {
	commandHandler.loadAll();
} catch (error: unknown) {
	commandHandlerLogger.error(error);
	crash(ExitCode.CommandHandlerLoadError);
}

commandHandlerLogger.success('Loaded commands');

const docs = generateDocs(commandHandler);

const baseDirectory = path.join(__dirname, '..', 'command_docs');
mkdir(baseDirectory)
	.then(async () => {
		/** Promises for creating the documentation folders before writing the doc files. */
		const createFolders = docs.keyArray().map(async categoryID => mkdir(path.join(baseDirectory, categoryID)));

		try {
			await Promise.all(createFolders);
		} catch (error: unknown) {
			logger.fatal(error);
			crash(ExitCode.FSMkdirError);
			return;
		}

		const writeOperations: Array<Promise<void>> = docs
			.mapValues((category, categoryID) =>
				category.mapValues(async (commandDocs, commandID) => writeFile(path.join(baseDirectory, categoryID, `${commandID}.md`), commandDocs, {})).array()
			)
			.array()
			.flat();

		try {
			await Promise.all(writeOperations);
		} catch (error: unknown) {
			logger.fatal(error);
			crash(ExitCode.FSWriteError);
			return;
		}

		logger.success(`Generated ${writeOperations.length.toLocaleString()} documentation files`);
		return process.exit(ExitCode.Success);
	})
	.catch(error => {
		logger.fatal(error);
		logger.info('Try deleting the documentation folder');
		crash(ExitCode.FSMkdirError);
	});
