import { Context, Schema } from 'koishi';
export interface Config {
    activeMarketCapBlacklist?: string[];
    stockAlertBlacklist?: string[];
    limitUpBoardBlacklist?: string[];
    stockSelectionBlacklist?: string[];
    rideBlacklist?: string[];
    allCommandsBlacklist?: string[];
}
export declare const Config: Schema<Config>;
export declare function apply(ctx: Context, config: Config): void;
