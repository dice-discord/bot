import {ShardingManager, SharderEvents} from 'kurasuta';
import {baseLogger} from '../logging/logger';

export function registerSharderEvents(sharder: ShardingManager, logger?: typeof baseLogger): ShardingManager {
	const usedLogger = logger ?? baseLogger.scope('sharder');

	// #region sharder event listeners
	sharder.on(SharderEvents.DEBUG, message => {
		usedLogger.debug({prefix: 'debug', message});
	});
	sharder.on(SharderEvents.MESSAGE, message => {
		usedLogger.debug({prefix: 'message', message});
	});
	sharder.on(SharderEvents.READY, cluster => {
		usedLogger.success({prefix: `cluster ${cluster.id}`, message: 'Ready'});
	});
	sharder.on(SharderEvents.SPAWN, cluster => {
		usedLogger.start({prefix: `cluster ${cluster.id}`, message: 'Spawned'});
	});
	sharder.on(SharderEvents.SHARD_READY, shardID => {
		usedLogger.success({prefix: `shard ${shardID}`, message: 'Ready'});
	});
	sharder.on(SharderEvents.SHARD_RECONNECT, shardID => {
		usedLogger.start({prefix: `shard ${shardID}`, message: 'Reconnected'});
	});
	sharder.on(SharderEvents.SHARD_RESUME, (replayed, shardID) => {
		usedLogger.start({prefix: `shard ${shardID}`, message: `Resumed, replayed 1 ${replayed}`});
	});
	sharder.on(SharderEvents.SHARD_DISCONNECT, (closeEvent, shardID) => {
		usedLogger.warn({
			prefix: `shard ${shardID}`,
			message: `Disconnected (${closeEvent.code}, ${closeEvent.wasClean ? '' : 'not '}clean): ${closeEvent.reason}`
		});
	});
	// #endregion

	return sharder;
}
