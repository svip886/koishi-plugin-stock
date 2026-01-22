import { Context, Schema } from 'koishi';
export interface Config {
    blacklistedUsers?: string[];
    blacklistedChannels?: string[];
}
export declare const Config: Schema<Config>;
export declare function apply(ctx: Context, config: Config): void;
