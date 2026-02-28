export function isUserInSpecificBlacklist(session: any, commandType: string, config: any): boolean {
  const userId = session?.userId || ''
  const channelId = session?.channelId || ''
  
  // 检查特定指令的用户黑名单
  switch (commandType) {
    case '活跃市值':
      if (config.activeMarketCapBlacklist?.includes(userId)) {
        return true
      }
      break
    case '涨停看板':
      if (config.limitUpBoardBlacklist?.includes(userId)) {
        return true
      }
      break
    case '跌停看板':
      if (config.limitDownBoardBlacklist?.includes(userId)) {
        return true
      }
      break
    case '选股':
      if (config.stockSelectionBlacklist?.includes(userId)) {
        return true
      }
      break
    case '骑':
      if (config.rideBlacklist?.includes(userId)) {
        return true
      }
      break
    case '心法抽卡':
      if (config.heartMethodBlacklist?.includes(userId)) {
        return true
      }
      break
    case '验牌':
      if (config.verifyCardBlacklist?.includes(userId)) {
        return true
      }
      break
  }
  
  // 检查特定指令的频道黑名单
  switch (commandType) {
    case '活跃市值':
      if (config.activeMarketCapChannelBlacklist?.includes(channelId)) {
        return true
      }
      break
    case '涨停看板':
      if (config.limitUpBoardChannelBlacklist?.includes(channelId)) {
        return true
      }
      break
    case '跌停看板':
      if (config.limitDownBoardChannelBlacklist?.includes(channelId)) {
        return true
      }
      break
    case '选股':
      if (config.stockSelectionChannelBlacklist?.includes(channelId)) {
        return true
      }
      break
    case '骑':
      if (config.rideChannelBlacklist?.includes(channelId)) {
        return true
      }
      break
    case '心法抽卡':
      if (config.heartMethodChannelBlacklist?.includes(channelId)) {
        return true
      }
      break
    case '验牌':
      if (config.verifyCardChannelBlacklist?.includes(channelId)) {
        return true
      }
      break
  }
  
  // 检查全局用户黑名单
  if (config.allCommandsBlacklist?.includes(userId)) {
    return true
  }
  
  // 检查全局频道黑名单
  if (config.allCommandsChannelBlacklist?.includes(channelId)) {
    return true
  }
  
  return false
}