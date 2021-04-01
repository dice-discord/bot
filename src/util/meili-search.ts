import {Snowflake} from 'discord.js';

export enum IndexNames {
	Users = 'users'
}

export interface Indexes {
	[IndexNames.Users]: {
		id: Snowflake;
		tag: string;
	};
}
