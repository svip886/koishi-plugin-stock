import { Context, Schema } from 'koishi'
import { HeartMethodManager } from './core/heart-data'
import { TradingDayChecker } from './core/trading-day'
import { BroadcastScheduler } from './core/broadcast'
import { HeartCommands } from './commands/heart-commands'
import { VerifyCardCommand } from './commands/verify-card'
import { StockCommands } from './commands/stock-commands'
import { isUserInSpecificBlacklist } from './utils/blacklist'

// 类型定义
interface BroadcastTask {
  times: string
  type: 'private' | 'channel'
  targetIds: string
  content: '活跃市值' | '涨停看板' | '跌停看板'
}

interface Config {
  enableDebugLog?: boolean
  allCommandsBlacklist?: string[]
  activeMarketCapBlacklist?: string[]
  stockAlertBlacklist?: string[]
  limitUpBoardBlacklist?: string[]
  limitDownBoardBlacklist?: string[]
  stockSelectionBlacklist?: string[]
  rideBlacklist?: string[]
  allCommandsChannelBlacklist?: string[]
  activeMarketCapChannelBlacklist?: string[]
  stockAlertChannelBlacklist?: string[]
  limitUpBoardChannelBlacklist?: string[]
  limitDownBoardChannelBlacklist?: string[]
  stockSelectionChannelBlacklist?: string[]
  rideChannelBlacklist?: string[]
  broadcastTasks?: BroadcastTask[]
  // 心法抽卡配置
  enableHeartMethod?: boolean
  heartMethodBlacklist?: string[]
  heartMethodChannelBlacklist?: string[]
  verifyCardBlacklist?: string[]  
  verifyCardChannelBlacklist?: string[]
}

const BroadcastTaskSchema = Schema.object({
  times: Schema.string().description('触发时间 (逗号分隔的列表, 推荐格式: HH:mm,HH:mm)').default('09:30'),
  type: Schema.union([
    Schema.const('private').description('私人消息'),
    Schema.const('channel').description('频道消息'),
  ]).default('channel').description('消息类型'),
  targetIds: Schema.string().description('目标ID列表 (逗号分隔的列表)').default(''),
  content: Schema.union([
    Schema.const('活跃市值'),
    Schema.const('涨停看板'),
    Schema.const('跌停看板'),
  ]).default('活跃市值').description('广播内容'),
})

export const ConfigSchema = Schema.object({
  // --- 系统设置 ---
  enableDebugLog: Schema.boolean().description('启用详细调试日志').default(false),
  
  // --- 用户黑名单 ---
  allCommandsBlacklist: Schema.array(String).description('全部指令黑名单用户ID'),
  activeMarketCapBlacklist: Schema.array(String).description('活跃市值指令黑名单用户ID'),
  stockAlertBlacklist: Schema.array(String).description('个股预警指令黑名单用户ID'),
  limitUpBoardBlacklist: Schema.array(String).description('涨停看板指令黑名单用户ID'),
  limitDownBoardBlacklist: Schema.array(String).description('跌停看板指令黑名单用户ID'),
  stockSelectionBlacklist: Schema.array(String).description('选股指令黑名单用户ID'),
  rideBlacklist: Schema.array(String).description('骑指令黑名单用户ID'),
  heartMethodBlacklist: Schema.array(String).description('心法抽卡指令黑名单用户ID'),
  verifyCardBlacklist: Schema.array(String).description('验牌指令黑名单用户ID'),
  
  // --- 频道黑名单 ---
  allCommandsChannelBlacklist: Schema.array(String).description('全部指令黑名单频道ID'),
  activeMarketCapChannelBlacklist: Schema.array(String).description('活跃市值指令黑名单频道ID'),
  stockAlertChannelBlacklist: Schema.array(String).description('个股预警指令黑名单频道ID'),
  limitUpBoardChannelBlacklist: Schema.array(String).description('涨停看板指令黑名单频道ID'),
  limitDownBoardChannelBlacklist: Schema.array(String).description('跌停看板指令黑名单频道ID'),
  stockSelectionChannelBlacklist: Schema.array(String).description('选股指令黑名单频道ID'),
  rideChannelBlacklist: Schema.array(String).description('骑指令黑名单频道ID'),
  heartMethodChannelBlacklist: Schema.array(String).description('心法抽卡指令黑名单频道ID'),
  verifyCardChannelBlacklist: Schema.array(String).description('验牌指令黑名单频道ID'),
  
  // --- 定时广播 ---
  broadcastTasks: Schema.array(BroadcastTaskSchema).description('定时广播任务列表'),
  
  // --- 心法抽卡 ---
  enableHeartMethod: Schema.boolean().description('启用心法抽卡功能').default(true),
})

export const name = 'stock'

export function apply(ctx: Context, config: Config) {
  const logger = ctx.logger('stock')
  
  // 初始化心法数据
  let heartMethods = HeartMethodManager.getAllMethods()
  logger.info(`[心法抽卡] 直接加载内置心法数据，共 ${heartMethods.length} 条`)
  
  // 插件启动日志
  logger.info('stock 插件已加载')
  logger.info(`当前配置: broadcastTasks=${config.broadcastTasks?.length || 0} 个任务`)
  if (config.broadcastTasks && config.broadcastTasks.length > 0) {
    config.broadcastTasks.forEach((task, idx) => {
      logger.info(`任务 ${idx + 1}: times=${task.times}, type=${task.type}, targetIds=${task.targetIds}, content=${task.content}`)
    })
  }

  // 注册各类命令
  HeartCommands.register(ctx, config)
  VerifyCardCommand.register(ctx, config)
  StockCommands.register(ctx, config)
  
  // 设置定时广播任务
  if (config.broadcastTasks && config.broadcastTasks.length > 0) {
    BroadcastScheduler.setup(ctx, config, config.broadcastTasks)
  }
  
  // 使用中间件方式监听特定关键词（作为备用方案）
  ctx.middleware(async (session, next) => {
    const content = session.content?.trim()
    // 让其他命令通过
    return next()
  })
}