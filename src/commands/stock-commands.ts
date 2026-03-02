import { Context } from 'koishi'
import { isUserInSpecificBlacklist } from '../utils/blacklist'

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
          // 增加重试机制和更长的超时时间
          const responseText = await ctx.http.get('https://stock.svip886.com/api/indexes', { 
            responseType: 'text',
            timeout: 15000  // 增加超时时间到15秒
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
          // 增加重试机制和更长的超时时间
          const responseText = await ctx.http.get(`https://stock.svip886.com/api/analyze?code=${stockCode}`, { 
            responseType: 'text',
            timeout: 15000
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
          // 增加超时时间
          const imageUrl = 'https://stock.svip886.com/api/limit_up.png'
          const imageBuffer = await ctx.http.get(imageUrl, { 
            responseType: 'arraybuffer',
            timeout: 15000
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
          // 增加超时时间
          const imageUrl = 'https://stock.svip886.com/api/limit_down.png'
          const imageBuffer = await ctx.http.get(imageUrl, { 
            responseType: 'arraybuffer',
            timeout: 15000
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
          'N型': 'dx',
          '填坑': 'tk',
          '少妇': 'sf',
          '突破': 'tp',
          '补票': 'bp',
          '少妇pro': 'sfpro',
          '1': 'dx',
          '2': 'tk', 
          '3': 'sf',
          '4': 'tp',
          '5': 'bp',
          '6': 'sfpro'
        }
        
        const apiEndpoint = strategyMap[strategy]
        if (!apiEndpoint) {
          return `不支持的选股策略: ${strategy}\n支持的策略：N型(1)、填坑(2)、少妇(3)、突破(4)、补票(5)、少妇pro(6)`
        }
        
        try {
          // 增加重试机制和更长的超时时间
          const responseText = await ctx.http.get(`https://stock.svip886.com/api/dyq_${apiEndpoint}`, { 
            responseType: 'text',
            timeout: 15000
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