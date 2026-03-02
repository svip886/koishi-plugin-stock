import { Context } from 'koishi'
import { TradingDayChecker } from '../core/trading-day'

// 带重试机制的HTTP请求函数
async function httpRequestWithRetry<T = any>(
  ctx: Context,
  url: string,
  options: any,
  maxRetries: number = 3
): Promise<T> {
  const logger = ctx.logger('stock')
  let lastError: Error = new Error('Unknown error')
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`[定时任务] 第${attempt}次尝试请求: ${url}`)
      const result = await ctx.http.get(url, {
        ...options,
        timeout: 10000
      })
      logger.info(`[定时任务] 第${attempt}次请求成功`)
      return result
    } catch (error) {
      lastError = error
      logger.warn(`[定时任务] 第${attempt}次请求失败:`, error.message)
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000
        logger.info(`[定时任务] 等待${delay}ms后进行第${attempt + 1}次重试`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  logger.error(`[定时任务] 所有${maxRetries}次重试都失败了`)
  throw lastError
}

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

            // 获取实际数据
            let messageContent = ''
            if (task.content === '活跃市值') {
              try {
                const responseText = await httpRequestWithRetry(ctx, 'https://stock.svip886.com/api/indexes', { 
                  responseType: 'text'
                })
                messageContent = `📊指数看板：\n\n${responseText}`
              } catch (error) {
                logger.error('[定时任务] 获取活跃市值数据失败:', error)
                messageContent = '获取活跃市值数据失败，请稍后重试。'
              }
            } else if (task.content === '涨停看板') {
              try {
                const imageUrl = 'https://stock.svip886.com/api/limit_up.png'
                const imageBuffer = await httpRequestWithRetry(ctx, imageUrl, { 
                  responseType: 'arraybuffer'
                })
                const base64Image = Buffer.from(imageBuffer).toString('base64')
                messageContent = `<img src="data:image/png;base64,${base64Image}" />`
              } catch (error) {
                logger.error('[定时任务] 获取涨停看板图片失败:', error)
                messageContent = '获取涨停看板图片失败，请稍后重试。'
              }
            } else if (task.content === '跌停看板') {
              try {
                const imageUrl = 'https://stock.svip886.com/api/limit_down.png'
                const imageBuffer = await httpRequestWithRetry(ctx, imageUrl, { 
                  responseType: 'arraybuffer'
                })
                const base64Image = Buffer.from(imageBuffer).toString('base64')
                messageContent = `<img src="data:image/png;base64,${base64Image}" />`
              } catch (error) {
                logger.error('[定时任务] 获取跌停看板图片失败:', error)
                messageContent = '获取跌停看板图片失败，请稍后重试。'
              }
            }

            // 添加定时广播前缀
            messageContent = `[定时广播 - ${task.content}] ${messageContent}`

            // 执行广播任务
            const targets = task.targetIds.split(',').map(id => id.trim()).filter(id => id)
            
            if (task.type === 'private') {
              targets.forEach(targetId => {
                ctx.bots.forEach(bot => {
                  bot.sendPrivateMessage(targetId, messageContent).catch(e => {
                    logger.error(`[定时任务] 私聊消息发送失败: ${e.message}`)
                  })
                })
              })
            } else {
              targets.forEach(targetId => {
                ctx.bots.forEach(bot => {
                  bot.sendMessage(targetId, messageContent).catch(e => {
                    logger.error(`[定时任务] 频道消息发送失败: ${e.message}`)
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