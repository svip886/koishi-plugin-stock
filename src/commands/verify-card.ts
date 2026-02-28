import { Context } from 'koishi'
import { HeartMethodManager } from '../core/heart-data'
import { isUserInSpecificBlacklist } from '../utils/blacklist'

export class VerifyCardCommand {
  static register(ctx: Context, config: any) {
    const logger = ctx.logger('stock')
    
    // 我要验牌命令
    ctx.command('我要验牌 [param:text]', '验牌功能：查看指定序号的心法或查看全部心法')
      .action(async ({ session }, param) => {
        // 检查黑名单
        if (isUserInSpecificBlacklist(session, '验牌', config)) {
          return
        }
        
        // 检查是否有心法数据
        if (HeartMethodManager.getCount() === 0) {
          return '暂无心法数据'
        }
        
        try {
          // 处理"全部"参数
          if (param && param.trim() === '全部') {
            logger.info(`[验牌] 用户 ${session?.userId || '未知'} 请求查看全部心法`)
            const result = HeartMethodManager.getAllTextWithNumbers()
            logger.info(`[验牌] 成功生成全部心法列表，共 ${HeartMethodManager.getCount()} 条`)
            return result
          }
          
          // 处理数字序号参数
          if (param && /^\d+$/.test(param.trim())) {
            const index = parseInt(param.trim()) - 1 // 转换为0基索引
            
            if (index < 0 || index >= HeartMethodManager.getCount()) {
              return `序号超出范围，请输入 1-${HeartMethodManager.getCount()} 之间的数字`
            }
            
            const selectedMethod = HeartMethodManager.getByIndex(index)
            logger.info(`[验牌] 用户 ${session?.userId || '未知'} 查看序号 ${index + 1}: ${selectedMethod?.code}`)
            
            // 读取对应的音频文件
            const fs = require('fs')
            const path = require('path')
            const audioPath = path.resolve(__dirname, `../../audio/${selectedMethod?.file}`)
            
            if (!fs.existsSync(audioPath)) {
              // 音频文件不存在，只返回文本
              return `🃏 验牌结果 #${index + 1}\n\n${selectedMethod?.text}\n\n(音频文件缺失: ${selectedMethod?.file})`
            }
            
            // 读取音频文件并转换为base64
            const audioData = fs.readFileSync(audioPath)
            const base64Audio = audioData.toString('base64')
            
            // 返回音频消息
            const response = `<audio src="data:audio/mp3;base64,${base64Audio}" />#${index + 1} ${selectedMethod?.text}`
            logger.info(`[验牌] 成功生成序号 ${index + 1} 的响应`)
            return response
          }
          
          // 参数格式错误
          return '参数格式错误。请使用：\n"我要验牌 全部" - 查看所有心法\n"我要验牌 <序号>" - 查看指定序号的心法(1-58)'
          
        } catch (error) {
          logger.error('[验牌] 执行失败:', error)
          logger.error('[验牌] 错误详情:', error.stack)
          return '验牌失败，请稍后重试'
        }
      })
  }
}