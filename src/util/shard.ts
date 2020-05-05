import {Snowflake} from 'discord.js';
import {ShardClientUtil} from 'kurasuta';

/**
 * Find the shard ID that is handling a guild by the guild ID.
 * Uses the formula provided by Discord.
 * @param guildID The string form of the guild ID
 * @param shardCount The total number of shards running
 * @returns The shard ID responsible for the provided guild ID
 * @example findShardIDByGuildID('388366947689168897', 6);
 * @see https://discord.com/developers/docs/topics/gateway#sharding-sharding-formula Formula for determining shard ID
 */
export function findShardIDByGuildID(guildID: Snowflake, shardCount: bigint): number {
	const calculated = (BigInt(guildID) >> BigInt(22)) % shardCount;

	// `calculated` should fit within [0, shardCount)
	if (calculated < 0 && calculated < shardCount) {
		return Number(calculated);
	}

	throw new Error(`Shard count is incorrect or bot is not on the guild ${guildID}`);
}

const responsibleShards = process.env.CLUSTER_SHARDS?.split(',').map(shard => Number.parseInt(shard, 10));

/** The shards this cluster is responsible for managing. */
export function getResponsibleShards(shard: ShardClientUtil): number[] {
	return responsibleShards ?? [shard.id];
}

/** The total number of clusters. */
export function getClusterCount(shard: ShardClientUtil): number {
	return shard?.clusterCount ?? 0;
}

/** This cluster's ID. */
export const clusterID = process.env.CLUSTER_ID === undefined ? 0 : Number.parseInt(process.env.CLUSTER_ID, 10);
