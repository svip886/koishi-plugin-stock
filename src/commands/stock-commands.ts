import { Context } from 'koishi'
import { isUserInSpecificBlacklist } from '../utils/blacklist'

export class StockCommands {
  static register(ctx: Context, config: any) {
    const logger = ctx.logger('stock')
    
    // 活跃市值命令
    ctx.middleware(async (session, next) => {
      const content = session.content?.trim()
      
      if (content === '活跃市值') {
        if (isUserInSpecificBlacklist(session, '活跃市值', config)) {
          return
        }
        
        try {
          const responseText = await ctx.http.get('http://stock.svip886.com/api/indexes', { responseType: 'text' })
          return `📊 指数看板：\n\n${responseText}`
        } catch (error) {
          logger.error('获取活跃市值数据失败:', error)
          return '获取活跃市值数据失败，请稍后重试。'
        }
      }
      
      return next()
    })
    
    // 涨停看板命令
    ctx.middleware(async (session, next) => {
      const content = session.content?.trim()
      
      if (content === '涨停看板') {
        if (isUserInSpecificBlacklist(session, '涨停看板', config)) {
          return
        }
        
        try {
          const imageUrl = 'http://stock.svip886.com/api/limit_up.png'
          const imageBuffer = await ctx.http.get(imageUrl, { responseType: 'arraybuffer' })
          const base64Image = Buffer.from(imageBuffer).toString('base64')
          return `<img src="data:image/png;base64,${base64Image}" />`
        } catch (error) {
          logger.error('获取涨停看板图片失败:', error)
          return '获取涨停看板图片失败，请稍后重试。'
        }
      }
      
      return next()
    })
    
    // 跌停看板命令
    ctx.middleware(async (session, next) => {
      const content = session.content?.trim()
      
      if (content === '跌停看板') {
        if (isUserInSpecificBlacklist(session, '跌停看板', config)) {
          return
        }
        
        try {
          const imageUrl = 'http://stock.svip886.com/api/limit_down.png'
          const imageBuffer = await ctx.http.get(imageUrl, { responseType: 'arraybuffer' })
          const base64Image = Buffer.from(imageBuffer).toString('base64')
          return `<img src="data:image/png;base64,${base64Image}" />`
        } catch (error) {
          logger.error('获取跌停看板图片失败:', error)
          return '获取跌停看板图片失败，请稍后重试。'
        }
      }
      
      return next()
    })
  }
}