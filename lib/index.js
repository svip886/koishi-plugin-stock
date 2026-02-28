"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.name = exports.ConfigSchema = void 0;
exports.apply = apply;
const koishi_1 = require("koishi");
const heart_data_1 = require("./core/heart-data");
const broadcast_1 = require("./core/broadcast");
const heart_commands_1 = require("./commands/heart-commands");
const verify_card_1 = require("./commands/verify-card");
const stock_commands_1 = require("./commands/stock-commands");
const BroadcastTaskSchema = koishi_1.Schema.object({
    times: koishi_1.Schema.string().description('触发时间 (逗号分隔的列表, 推荐格式: HH:mm,HH:mm)').default('09:30'),
    type: koishi_1.Schema.union([
        koishi_1.Schema.const('private').description('私人消息'),
        koishi_1.Schema.const('channel').description('频道消息'),
    ]).default('channel').description('消息类型'),
    targetIds: koishi_1.Schema.string().description('目标ID列表 (逗号分隔的列表)').default(''),
    content: koishi_1.Schema.union([
        koishi_1.Schema.const('活跃市值'),
        koishi_1.Schema.const('涨停看板'),
        koishi_1.Schema.const('跌停看板'),
    ]).default('活跃市值').description('广播内容'),
});
exports.ConfigSchema = koishi_1.Schema.object({
    // --- 系统设置 ---
    enableDebugLog: koishi_1.Schema.boolean().description('启用详细调试日志').default(false),
    // --- 用户黑名单 ---
    allCommandsBlacklist: koishi_1.Schema.array(String).description('全部指令黑名单用户ID'),
    activeMarketCapBlacklist: koishi_1.Schema.array(String).description('活跃市值指令黑名单用户ID'),
    stockAlertBlacklist: koishi_1.Schema.array(String).description('个股预警指令黑名单用户ID'),
    limitUpBoardBlacklist: koishi_1.Schema.array(String).description('涨停看板指令黑名单用户ID'),
    limitDownBoardBlacklist: koishi_1.Schema.array(String).description('跌停看板指令黑名单用户ID'),
    stockSelectionBlacklist: koishi_1.Schema.array(String).description('选股指令黑名单用户ID'),
    rideBlacklist: koishi_1.Schema.array(String).description('骑指令黑名单用户ID'),
    heartMethodBlacklist: koishi_1.Schema.array(String).description('心法抽卡指令黑名单用户ID'),
    verifyCardBlacklist: koishi_1.Schema.array(String).description('验牌指令黑名单用户ID'),
    // --- 频道黑名单 ---
    allCommandsChannelBlacklist: koishi_1.Schema.array(String).description('全部指令黑名单频道ID'),
    activeMarketCapChannelBlacklist: koishi_1.Schema.array(String).description('活跃市值指令黑名单频道ID'),
    stockAlertChannelBlacklist: koishi_1.Schema.array(String).description('个股预警指令黑名单频道ID'),
    limitUpBoardChannelBlacklist: koishi_1.Schema.array(String).description('涨停看板指令黑名单频道ID'),
    limitDownBoardChannelBlacklist: koishi_1.Schema.array(String).description('跌停看板指令黑名单频道ID'),
    stockSelectionChannelBlacklist: koishi_1.Schema.array(String).description('选股指令黑名单频道ID'),
    rideChannelBlacklist: koishi_1.Schema.array(String).description('骑指令黑名单频道ID'),
    heartMethodChannelBlacklist: koishi_1.Schema.array(String).description('心法抽卡指令黑名单频道ID'),
    verifyCardChannelBlacklist: koishi_1.Schema.array(String).description('验牌指令黑名单频道ID'),
    // --- 定时广播 ---
    broadcastTasks: koishi_1.Schema.array(BroadcastTaskSchema).description('定时广播任务列表'),
    // --- 心法抽卡 ---
    enableHeartMethod: koishi_1.Schema.boolean().description('启用心法抽卡功能').default(true),
});
exports.name = 'stock';
function apply(ctx, config) {
    const logger = ctx.logger('stock');
    // 初始化心法数据
    let heartMethods = heart_data_1.HeartMethodManager.getAllMethods();
    logger.info(`[心法抽卡] 直接加载内置心法数据，共 ${heartMethods.length} 条`);
    // 插件启动日志
    logger.info('stock 插件已加载');
    logger.info(`当前配置: broadcastTasks=${config.broadcastTasks?.length || 0} 个任务`);
    if (config.broadcastTasks && config.broadcastTasks.length > 0) {
        config.broadcastTasks.forEach((task, idx) => {
            logger.info(`任务 ${idx + 1}: times=${task.times}, type=${task.type}, targetIds=${task.targetIds}, content=${task.content}`);
        });
    }
    // 注册各类命令
    heart_commands_1.HeartCommands.register(ctx, config);
    verify_card_1.VerifyCardCommand.register(ctx, config);
    stock_commands_1.StockCommands.register(ctx, config);
    // 设置定时广播任务
    if (config.broadcastTasks && config.broadcastTasks.length > 0) {
        broadcast_1.BroadcastScheduler.setup(ctx, config, config.broadcastTasks);
    }
    // 使用中间件方式监听特定关键词（作为备用方案）
    ctx.middleware(async (session, next) => {
        const content = session.content?.trim();
        // 让其他命令通过
        return next();
    });
}
