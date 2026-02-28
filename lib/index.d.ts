import { Context, Schema } from 'koishi';
interface BroadcastTask {
    times: string;
    type: 'private' | 'channel';
    targetIds: string;
    content: '活跃市值' | '涨停看板' | '跌停看板';
}
interface Config {
    enableDebugLog?: boolean;
    allCommandsBlacklist?: string[];
    activeMarketCapBlacklist?: string[];
    stockAlertBlacklist?: string[];
    limitUpBoardBlacklist?: string[];
    limitDownBoardBlacklist?: string[];
    stockSelectionBlacklist?: string[];
    rideBlacklist?: string[];
    allCommandsChannelBlacklist?: string[];
    activeMarketCapChannelBlacklist?: string[];
    stockAlertChannelBlacklist?: string[];
    limitUpBoardChannelBlacklist?: string[];
    limitDownBoardChannelBlacklist?: string[];
    stockSelectionChannelBlacklist?: string[];
    rideChannelBlacklist?: string[];
    broadcastTasks?: BroadcastTask[];
    enableHeartMethod?: boolean;
    heartMethodBlacklist?: string[];
    heartMethodChannelBlacklist?: string[];
    verifyCardBlacklist?: string[];
    verifyCardChannelBlacklist?: string[];
}
export declare const ConfigSchema: Schema<Schemastery.ObjectS<{
    enableDebugLog: Schema<boolean, boolean>;
    allCommandsBlacklist: Schema<string[], string[]>;
    activeMarketCapBlacklist: Schema<string[], string[]>;
    stockAlertBlacklist: Schema<string[], string[]>;
    limitUpBoardBlacklist: Schema<string[], string[]>;
    limitDownBoardBlacklist: Schema<string[], string[]>;
    stockSelectionBlacklist: Schema<string[], string[]>;
    rideBlacklist: Schema<string[], string[]>;
    heartMethodBlacklist: Schema<string[], string[]>;
    verifyCardBlacklist: Schema<string[], string[]>;
    allCommandsChannelBlacklist: Schema<string[], string[]>;
    activeMarketCapChannelBlacklist: Schema<string[], string[]>;
    stockAlertChannelBlacklist: Schema<string[], string[]>;
    limitUpBoardChannelBlacklist: Schema<string[], string[]>;
    limitDownBoardChannelBlacklist: Schema<string[], string[]>;
    stockSelectionChannelBlacklist: Schema<string[], string[]>;
    rideChannelBlacklist: Schema<string[], string[]>;
    heartMethodChannelBlacklist: Schema<string[], string[]>;
    verifyCardChannelBlacklist: Schema<string[], string[]>;
    broadcastTasks: Schema<Schemastery.ObjectS<{
        times: Schema<string, string>;
        type: Schema<"private" | "channel", "private" | "channel">;
        targetIds: Schema<string, string>;
        content: Schema<"活跃市值" | "涨停看板" | "跌停看板", "活跃市值" | "涨停看板" | "跌停看板">;
    }>[], Schemastery.ObjectT<{
        times: Schema<string, string>;
        type: Schema<"private" | "channel", "private" | "channel">;
        targetIds: Schema<string, string>;
        content: Schema<"活跃市值" | "涨停看板" | "跌停看板", "活跃市值" | "涨停看板" | "跌停看板">;
    }>[]>;
    enableHeartMethod: Schema<boolean, boolean>;
}>, Schemastery.ObjectT<{
    enableDebugLog: Schema<boolean, boolean>;
    allCommandsBlacklist: Schema<string[], string[]>;
    activeMarketCapBlacklist: Schema<string[], string[]>;
    stockAlertBlacklist: Schema<string[], string[]>;
    limitUpBoardBlacklist: Schema<string[], string[]>;
    limitDownBoardBlacklist: Schema<string[], string[]>;
    stockSelectionBlacklist: Schema<string[], string[]>;
    rideBlacklist: Schema<string[], string[]>;
    heartMethodBlacklist: Schema<string[], string[]>;
    verifyCardBlacklist: Schema<string[], string[]>;
    allCommandsChannelBlacklist: Schema<string[], string[]>;
    activeMarketCapChannelBlacklist: Schema<string[], string[]>;
    stockAlertChannelBlacklist: Schema<string[], string[]>;
    limitUpBoardChannelBlacklist: Schema<string[], string[]>;
    limitDownBoardChannelBlacklist: Schema<string[], string[]>;
    stockSelectionChannelBlacklist: Schema<string[], string[]>;
    rideChannelBlacklist: Schema<string[], string[]>;
    heartMethodChannelBlacklist: Schema<string[], string[]>;
    verifyCardChannelBlacklist: Schema<string[], string[]>;
    broadcastTasks: Schema<Schemastery.ObjectS<{
        times: Schema<string, string>;
        type: Schema<"private" | "channel", "private" | "channel">;
        targetIds: Schema<string, string>;
        content: Schema<"活跃市值" | "涨停看板" | "跌停看板", "活跃市值" | "涨停看板" | "跌停看板">;
    }>[], Schemastery.ObjectT<{
        times: Schema<string, string>;
        type: Schema<"private" | "channel", "private" | "channel">;
        targetIds: Schema<string, string>;
        content: Schema<"活跃市值" | "涨停看板" | "跌停看板", "活跃市值" | "涨停看板" | "跌停看板">;
    }>[]>;
    enableHeartMethod: Schema<boolean, boolean>;
}>>;
export declare const name = "stock";
export declare function apply(ctx: Context, config: Config): void;
export {};
