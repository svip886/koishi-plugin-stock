import { Context } from 'koishi'

export class TradingDayChecker {
  private static logger: any
  
  static async isTradingDay(ctx: Context): Promise<boolean> {
    if (!this.logger) {
      this.logger = ctx.logger('stock')
    }
    
    try {
      const tradingResponse = await ctx.http.get('https://stock.svip886.com/api/is_trading_day')
      
      // 检查响应结构
      if (tradingResponse && typeof tradingResponse === 'object' && tradingResponse.success === true) {
        const isTradingDay = tradingResponse.is_trading_day === true
        this.logger.info(`[交易日判断] 日期: ${tradingResponse.date}, 是否交易日: ${isTradingDay}, 最近交易日: ${tradingResponse.latest_trade_date}`)
        return isTradingDay
      } else {
        this.logger.error('[交易日判断] API返回格式异常')
        return false
      }
    } catch (e) {
      this.logger.error(`[交易日判断] API请求失败: ${e.message}`)
      // 请求失败时，默认不执行任务以保证安全
      this.logger.warn('[交易日判断] 请求失败，默认跳过任务')
      return false
    }
  }
}