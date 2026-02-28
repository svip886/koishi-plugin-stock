import { Context } from 'koishi'
import { TradingDayChecker } from '../core/trading-day'

interface BroadcastTask {
  times: string
  type: 'private' | 'channel'
  targetIds: string
  content: '活跃市值' | '涨停看板' | '跌停看板'
}

export class BroadcastScheduler {
  static setup(ctx: Context, config: any, tasks: BroadcastTask[]) {
    const logger = ctx.logger('stock')
    
    if (!tasks || tasks.length === 0) {
      return
    }
    
    // 简化版本：使用setInterval每分钟检查
    ctx.setInterval(async () => {
      const now = new Date()
      const shanghaiTime = new Date(now.getTime() + 8 * 60 * 60 * 1000)
      const currentTime = `${shanghaiTime.getHours().toString().padStart(2, '0')}:${shanghaiTime.getMinutes().toString().padStart(2, '0')}`
      
      for (const task of tasks) {
        const times = task.times.split(',').map(t => t.trim())
        if (times.includes(currentTime)) {
          try {
            // 判断是否为交易日
            const tradingDay = await TradingDayChecker.isTradingDay(ctx)
            if (!tradingDay) {
              logger.info('[定时任务跳过] 今日非交易日')
              continue
            }

            // 执行广播任务
            const targets = task.targetIds.split(',').map(id => id.trim()).filter(id => id)
            
            if (task.type === 'private') {
              targets.forEach(targetId => {
                ctx.bots.forEach(bot => {
                  bot.sendPrivateMessage(targetId, `[${task.content}] 定时推送`).catch(e => {
                    logger.error(`私聊消息发送失败: ${e.message}`)
                  })
                })
              })
            } else {
              targets.forEach(targetId => {
                ctx.bots.forEach(bot => {
                  bot.sendMessage(targetId, `[${task.content}] 定时推送`).catch(e => {
                    logger.error(`频道消息发送失败: ${e.message}`)
                  })
                })
              })
            }
          } catch (error) {
            logger.error('[定时任务] 执行失败:', error)
          }
        }
      }
    }, 60000) // 每分钟检查一次
  }
}