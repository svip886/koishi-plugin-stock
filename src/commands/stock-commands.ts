import { Context } from 'koishi'
import { isUserInSpecificBlacklist } from '../utils/blacklist'

// 带重试机制的HTTP请求函数
async function httpRequestWithRetry<T = any>(
  ctx: Context,
  url: string,
  options: any,
  maxRetries: number = 3
): Promise<T> {
  const logger = ctx.logger('stock')
  let lastError: Error = new Error('Unknown error')  // 初始化错误对象
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`第${attempt}次尝试请求: ${url}`)
      const result = await ctx.http.get(url, {
        ...options,
        timeout: 10000  // 设置为10秒超时
      })
      logger.info(`第${attempt}次请求成功`)
      return result
    } catch (error) {
      lastError = error
      logger.warn(`第${attempt}次请求失败:`, error.message)
      
      // 如果不是最后一次尝试，等待一段时间后重试
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000 // 指数退避: 2s, 4s, 8s
        logger.info(`等待${delay}ms后进行第${attempt + 1}次重试`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  // 所有重试都失败了
  logger.error(`所有${maxRetries}次重试都失败了`)
  throw lastError
}

export class StockCommands {
  static register(ctx: Context, config: any) {
    const logger = ctx.logger('stock')
    
    // 活跃市值命令
    ctx.command('活跃市值', '获取活跃市值数据')
      .action(async ({ session }) => {
        if (isUserInSpecificBlacklist(session, '活跃市值', config)) {
          return
        }
        
        try {
          // 使用带重试机制的HTTP请求
          const responseText = await httpRequestWithRetry(ctx, 'https://stock.svip886.com/api/indexes', { 
            responseType: 'text'
          })
          return `📊 指数看板：\n\n${responseText}`
        } catch (error) {
          logger.error('获取活跃市值数据失败:', error)
          logger.error('错误类型:', error.constructor.name)
          logger.error('错误消息:', error.message)
          // 提供更有帮助的错误信息
          if (error.message && error.message.includes('timeout')) {
            return '获取活跃市值数据超时，请检查网络连接后重试。'
          }
          return '获取活跃市值数据失败，请稍后重试。'
        }
      })
    
    // 异动命令
    ctx.command('异动 <stockCode:text>', '获取指定股票的异动分析数据')
      .action(async ({ session }, stockCode) => {
        if (isUserInSpecificBlacklist(session, '异动', config)) {
          return
        }
        
        if (!stockCode) {
          return '请输入股票代码，格式：异动 [股票代码]'
        }
        
        try {
          // 使用带重试机制的HTTP请求
          const responseText = await httpRequestWithRetry(ctx, `https://stock.svip886.com/api/analyze?code=${stockCode}`, { 
            responseType: 'text'
          })
          return `📈 股票 ${stockCode} 异动分析：\n\n${responseText}`
        } catch (error) {
          logger.error('获取股票异动数据失败:', error)
          logger.error('错误类型:', error.constructor.name)
          logger.error('错误消息:', error.message)
          if (error.message && error.message.includes('timeout')) {
            return `获取股票 ${stockCode} 异动数据超时，请检查网络连接后重试。`
          }
          return `获取股票 ${stockCode} 异动数据失败，请稍后重试。`
        }
      })
    
    // 涨停看板命令
    ctx.command('涨停看板', '获取涨停看板图片')
      .action(async ({ session }) => {
        if (isUserInSpecificBlacklist(session, '涨停看板', config)) {
          return
        }
        
        try {
          // 使用带重试机制的HTTP请求获取图片
          const imageUrl = 'https://stock.svip886.com/api/limit_up.png'
          const imageBuffer = await httpRequestWithRetry(ctx, imageUrl, { 
            responseType: 'arraybuffer'
          })
          const base64Image = Buffer.from(imageBuffer).toString('base64')
          return `<img src="data:image/png;base64,${base64Image}" />`
        } catch (error) {
          logger.error('获取涨停看板图片失败:', error)
          logger.error('错误类型:', error.constructor.name)
          logger.error('错误消息:', error.message)
          if (error.message && error.message.includes('timeout')) {
            return '获取涨停看板图片超时，请检查网络连接后重试。'
          }
          return '获取涨停看板图片失败，请稍后重试。'
        }
      })
    
    // 跌停看板命令
    ctx.command('跌停看板', '获取跌停看板图片')
      .action(async ({ session }) => {
        if (isUserInSpecificBlacklist(session, '跌停看板', config)) {
          return
        }
        
        try {
          // 使用带重试机制的HTTP请求获取图片
          const imageUrl = 'https://stock.svip886.com/api/limit_down.png'
          const imageBuffer = await httpRequestWithRetry(ctx, imageUrl, { 
            responseType: 'arraybuffer'
          })
          const base64Image = Buffer.from(imageBuffer).toString('base64')
          return `<img src="data:image/png;base64,${base64Image}" />`
        } catch (error) {
          logger.error('获取跌停看板图片失败:', error)
          logger.error('错误类型:', error.constructor.name)
          logger.error('错误消息:', error.message)
          if (error.message && error.message.includes('timeout')) {
            return '获取跌停看板图片超时，请检查网络连接后重试。'
          }
          return '获取跌停看板图片失败，请稍后重试。'
        }
      })
    
    // 选股命令
    ctx.command('选股 <strategy:text>', '根据指定策略选股')
      .action(async ({ session }, strategy) => {
        if (isUserInSpecificBlacklist(session, '选股', config)) {
          return
        }
        
        if (!strategy) {
          return '请输入选股策略，格式：选股 [策略名称或编号]\n支持的策略：N型(1)、填坑(2)、少妇(3)、突破(4)、补票(5)、少妇pro(6)'
        }
        
        // 映射策略名称到API端点
        const strategyMap: Record<string, string> = {
          'N型': 'n_shape',
          'n_shape': 'n_shape',
          '1': 'n_shape',
          '填坑': 'fill_pit',
          'fill_pit': 'fill_pit',
          '2': 'fill_pit',
          '少妇': 'young_woman',
          'young_woman': 'young_woman',
          '3': 'young_woman',
          '突破': 'breakthrough',
          'breakthrough': 'breakthrough',
          '4': 'breakthrough',
          '补票': 'ticket',
          'ticket': 'ticket',
          '5': 'ticket',
          '少妇pro': 'young_woman_pro',
          'young_woman_pro': 'young_woman_pro',
          '6': 'young_woman_pro'
        }
        
        const apiEndpoint = strategyMap[strategy]
        if (!apiEndpoint) {
          return `不支持的选股策略: ${strategy}\n支持的策略：N型(1)、填坑(2)、少妇(3)、突破(4)、补票(5)、少妇pro(6)`
        }
        
        try {
          // 使用带重试机制的HTTP请求
          const responseText = await httpRequestWithRetry(ctx, `https://stock.svip886.com/api/dyq_select/${apiEndpoint}`, { 
            responseType: 'text'
          })
          return `🎯 选股结果 (${strategy}): \n\n${responseText}`
        } catch (error) {
          logger.error('获取选股数据失败:', error)
          logger.error('错误类型:', error.constructor.name)
          logger.error('错误消息:', error.message)
          if (error.message && error.message.includes('timeout')) {
            return `获取选股数据超时，请检查网络连接后重试。`
          }
          return `获取选股数据失败，请稍后重试。`
        }
      })
    
    // 骑命令
    ctx.command('骑', '获取骑图片')
      .action(async ({ session }) => {
        if (isUserInSpecificBlacklist(session, '骑', config)) {
          return
        }
        
        try {
          // 读取本地图片文件
          const fs = require('fs')
          const path = require('path')
          const imagePath = path.resolve(__dirname, '../../images/qi.jpeg')
          
          if (!fs.existsSync(imagePath)) {
            logger.error('骑图片文件不存在:', imagePath)
            return '骑图片文件缺失，请联系管理员'
          }
          
          // 读取图片文件并转换为base64
          const imageBuffer = fs.readFileSync(imagePath)
          const base64Image = imageBuffer.toString('base64')
          
          return `<img src="data:image/jpeg;base64,${base64Image}" />`
        } catch (error) {
          logger.error('获取骑图片失败:', error)
          logger.error('错误详情:', error.stack)
          return '获取骑图片失败，请稍后重试。'
        }
      })
  }
}