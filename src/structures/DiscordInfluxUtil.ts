import {AkairoClient} from 'discord-akairo';
import {FieldType, InfluxDB} from 'influx';
import {Integer} from '../../types/opaque';
import {clusterID} from '../util/shard';

/* eslint-disable camelcase */

/** Measurements recorded on InfluxDB. */
type SchemaMeasurements = 'discord';

/** A type representing the options used to record a measurement of the `discord` schema. */
type DiscordSchema = {
	guild_count: Integer;
	user_count: Integer;
	channel_count: Integer;
};

/** A type representing the schema options passed to add a schema to InfluxDB. */
type SchemaOptions<T> = Required<Record<keyof T, FieldType>>;

/** Tags used for the `discord` schema. */
type DiscordSchemaTags = 'cluster_id';

/**
 * A class to help Discord clients periodically record statistics to InfluxDB.
 */
export class DiscordInfluxUtil {
	/** The InfluxDB client for this isntance. */
	public influx: InfluxDB;
	client: AkairoClient;

	/**
	 * @param dsn The InfluxDB DSN to use to connect
	 * @param client The Discord client to use
	 */
	constructor(dsn: string, client: AkairoClient) {
		this.influx = new InfluxDB(dsn);
		this.client = client;

		this.influx.addSchema({
			measurement: 'discord' as SchemaMeasurements,
			// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
			fields: {
				guild_count: FieldType.INTEGER,
				user_count: FieldType.INTEGER,
				channel_count: FieldType.INTEGER
			} as SchemaOptions<DiscordSchema>,
			tags: ['cluster_id'] as DiscordSchemaTags[]
		});
	}

	/**
	 * Records a measurement to the `discord` schema
	 */
	async recordDiscordStats(): Promise<void> {
		const fields: DiscordSchema = {
			guild_count: this.client.guilds.cache.size as Integer,
			user_count: this.client.users.cache.size as Integer,
			channel_count: this.client.channels.cache.size as Integer
		};

		const tags: Record<DiscordSchemaTags, string> = {cluster_id: clusterID.toString()};

		return this.influx.writeMeasurement('discord' as SchemaMeasurements, [{tags, fields}]);
	}
}

/* eslint-enable camelcase */
