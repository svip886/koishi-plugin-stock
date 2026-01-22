import { Context, Schema } from 'koishi';
export interface Config {
    activeMarketCapBlacklist?: string[];
    stockAlertBlacklist?: string[];
    limitUpBoardBlacklist?: string[];
    stockSelectionBlacklist?: string[];
    rideBlacklist?: string[];
    allCommandsBlacklist?: string[];
    activeMarketCapChannelBlacklist?: string[];
    stockAlertChannelBlacklist?: string[];
    limitUpBoardChannelBlacklist?: string[];
    stockSelectionChannelBlacklist?: string[];
    rideChannelBlacklist?: string[];
    allCommandsChannelBlacklist?: string[];
}
export declare const Config: Schema<Config>;
export declare function apply(ctx: Context, config: Config): void;
