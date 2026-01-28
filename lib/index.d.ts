import { Context, Schema } from 'koishi';
export interface BroadcastTask {
    times: string;
    type: 'private' | 'channel';
    targetIds: string;
    content: '活跃市值' | '涨停看板' | '跌停看板';
}
export interface Config {
    enableDebugLog?: boolean;
    activeMarketCapBlacklist?: string[];
    stockAlertBlacklist?: string[];
    limitUpBoardBlacklist?: string[];
    limitDownBoardBlacklist?: string[];
    stockSelectionBlacklist?: string[];
    rideBlacklist?: string[];
    allCommandsBlacklist?: string[];
    activeMarketCapChannelBlacklist?: string[];
    stockAlertChannelBlacklist?: string[];
    limitUpBoardChannelBlacklist?: string[];
    limitDownBoardChannelBlacklist?: string[];
    stockSelectionChannelBlacklist?: string[];
    rideChannelBlacklist?: string[];
    allCommandsChannelBlacklist?: string[];
    broadcastTasks?: BroadcastTask[];
}
export declare const Config: Schema<Config>;
export declare function apply(ctx: Context, config: Config): void;
