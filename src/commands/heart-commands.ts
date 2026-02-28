import { Context } from 'koishi'
import { HeartMethodManager } from '../core/heart-data'
import { isUserInSpecificBlacklist } from '../utils/blacklist'

export class HeartCommands {
  static register(ctx: Context, config: any) {
    const logger = ctx.logger('stock')
    
    // 心法抽卡命令
    ctx.command('心法抽卡', '随机抽取一条交易心法')
      .action(async ({ session }) => {
        logger.info(`[心法抽卡] 收到命令请求，当前心法数据量: ${HeartMethodManager.getCount()}`)
        
        // 检查功能是否启用
        if (!config.enableHeartMethod) {
          logger.warn('[心法抽卡] 功能被禁用')
          return '心法抽卡功能未启用'
        }
        
        // 检查黑名单
        if (isUserInSpecificBlacklist(session, '心法抽卡', config)) {
          logger.info('[心法抽卡] 用户在黑名单中，静默处理')
          return
        }
        
        // 检查是否有心法数据
        if (HeartMethodManager.getCount() === 0) {
          logger.error('[心法抽卡] 心法数据为空')
          return '暂无心法数据，请联系管理员'
        }
        
        try {
          // 随机选择一个心法
          const randomIndex = Math.floor(Math.random() * HeartMethodManager.getCount())
          const selectedMethod = HeartMethodManager.getByIndex(randomIndex)
          
          if (!selectedMethod) {
            logger.error('[心法抽卡] 无法获取选定的心法')
            return '心法抽卡失败，请稍后重试'
          }
          
          logger.info(`[心法抽卡] 用户 ${session?.userId || '未知'} 抽中: ${selectedMethod.code} - ${selectedMethod.text}`)
          
          // 读取音频文件
          const fs = require('fs')
          const path = require('path')
          const audioPath = path.resolve(__dirname, `../../audio/${selectedMethod.file}`)
          
          logger.info(`[心法抽卡] 尝试读取音频文件: ${audioPath}`)
          
          if (!fs.existsSync(audioPath)) {
            logger.warn(`[心法抽卡] 音频文件不存在: ${audioPath}`)
            // 如果音频文件不存在，只返回文本
            return `🃏 心法抽卡\n\n${selectedMethod.text}\n\n(音频文件缺失: ${selectedMethod.file})`
          }
          
          // 读取音频文件并转换为base64
          const audioData = fs.readFileSync(audioPath)
          const base64Audio = audioData.toString('base64')
          
          logger.info(`[心法抽卡] 音频文件读取成功，大小: ${audioData.length} 字节`)
          
          // 返回音频消息
          const response = `<audio src="data:audio/mp3;base64,${base64Audio}" />${selectedMethod.text}`
          logger.info('[心法抽卡] 成功生成响应消息')
          return response
          
        } catch (error) {
          logger.error('[心法抽卡] 执行失败:', error)
          logger.error('[心法抽卡] 错误堆栈:', error.stack)
          return '心法抽卡失败，请稍后重试'
        }
      })
  }
}