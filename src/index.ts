import { Context, Schema } from 'koishi'

export interface BroadcastTask {
  time: string
  type: 'private' | 'channel'
  targetId: string
  content: '活跃市值' | '涨停看板' | '跌停看板'
}

export interface Config {
  activeMarketCapBlacklist?: string[]
  stockAlertBlacklist?: string[]
  limitUpBoardBlacklist?: string[]
  limitDownBoardBlacklist?: string[]
  stockSelectionBlacklist?: string[]
  rideBlacklist?: string[]
  allCommandsBlacklist?: string[]
  activeMarketCapChannelBlacklist?: string[]
  stockAlertChannelBlacklist?: string[]
  limitUpBoardChannelBlacklist?: string[]
  limitDownBoardChannelBlacklist?: string[]
  stockSelectionChannelBlacklist?: string[]
  rideChannelBlacklist?: string[]
  allCommandsChannelBlacklist?: string[]
  broadcastTasks?: BroadcastTask[]
}

const BroadcastTask: Schema<BroadcastTask> = Schema.object({
  time: Schema.string().description('触发时间 (格式 HH:mm)').pattern(/^([01]\d|2[0-3]):[0-5]\d$/),
  type: Schema.union([
    Schema.const('private').description('私人消息'),
    Schema.const('channel').description('频道消息'),
  ]).default('channel').description('消息类型'),
  targetId: Schema.string().description('目标用户或频道 ID'),
  content: Schema.union([
    Schema.const('活跃市值'),
    Schema.const('涨停看板'),
    Schema.const('跌停看板'),
  ]).description('广播内容'),
})

export const Config: Schema<Config> = Schema.object({
  allCommandsBlacklist: Schema.array(String).description('全部指令黑名单用户ID'),
  activeMarketCapBlacklist: Schema.array(String).description('活跃市值指令黑名单用户ID'),
  stockAlertBlacklist: Schema.array(String).description('异动指令黑名单用户ID'),
  limitUpBoardBlacklist: Schema.array(String).description('涨停看板指令黑名单用户ID'),
  limitDownBoardBlacklist: Schema.array(String).description('跌停看板指令黑名单用户ID'),
  stockSelectionBlacklist: Schema.array(String).description('选股指令黑名单用户ID'),
  rideBlacklist: Schema.array(String).description('骑指令黑名单用户ID'),
  allCommandsChannelBlacklist: Schema.array(String).description('全部指令黑名单频道ID'),
  activeMarketCapChannelBlacklist: Schema.array(String).description('活跃市值指令黑名单频道ID'),
  stockAlertChannelBlacklist: Schema.array(String).description('异动指令黑名单频道ID'),
  limitUpBoardChannelBlacklist: Schema.array(String).description('涨停看板指令黑名单频道ID'),
  limitDownBoardChannelBlacklist: Schema.array(String).description('跌停看板指令黑名单频道ID'),
  stockSelectionChannelBlacklist: Schema.array(String).description('选股指令黑名单频道ID'),
  rideChannelBlacklist: Schema.array(String).description('骑指令黑名单频道ID'),
  broadcastTasks: Schema.array(BroadcastTask).description('定时广播任务列表'),
})

export function apply(ctx: Context, config: Config) {
  // 定时任务逻辑
  let lastCheckedMinute = '';

  ctx.setInterval(async () => {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    if (currentTime === lastCheckedMinute) return;
    
    if (!config.broadcastTasks || config.broadcastTasks.length === 0) return;

    // 检查当前时间是否有任务
    const activeTasks = config.broadcastTasks.filter(t => t.time === currentTime);
    if (activeTasks.length === 0) return;

    lastCheckedMinute = currentTime;

    try {
      // 检查是否为交易日（基本周末检查 + 节假日API）
      const day = now.getDay();
      const isWeekend = (day === 0 || day === 6);
      const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
      
      let tradingDay = !isWeekend;
      try {
        const holidayData = await ctx.http.get(`https://timor.tech/api/holiday/info/${dateStr}`);
        if (holidayData && holidayData.type) {
          // type: 0 工作日, 1 周末, 2 节日, 3 调休
          tradingDay = (holidayData.type.type === 0 || holidayData.type.type === 3);
        }
      } catch (e) {
        // API 失败，使用基本周末检查
      }

      if (!tradingDay) return;

      for (const task of activeTasks) {
        try {
          let message = '';
          if (task.content === '活跃市值') {
            const responseText = await ctx.http.get('http://stock.svip886.com/api/indexes', { responseType: 'text' });
            message = `📊 定时广播 - 指数看板：\n\n${responseText}`;
          } else if (task.content === '涨停看板' || task.content === '跌停看板') {
            const apiType = task.content === '涨停看板' ? 'limit_up' : 'limit_down';
            const imageUrl = `http://stock.svip886.com/api/${apiType}.png`;
            const imageBuffer = await ctx.http.get(imageUrl, { responseType: 'arraybuffer' });
            const base64Image = Buffer.from(imageBuffer).toString('base64');
            message = `🔔 定时广播 - ${task.content}：\n<img src="data:image/png;base64,${base64Image}" />`;
          }

          if (message) {
            const bot = ctx.bots.find(b => (b.status as any) === 'online' || (b.status as any) === 1) || ctx.bots[0];
            if (bot) {
              if (task.type === 'private') {
                await bot.sendPrivateMessage(task.targetId, message);
              } else {
                await bot.sendMessage(task.targetId, message);
              }
            }
          }
        } catch (error) {
          ctx.logger('stock').error(`定时广播任务执行失败: ${task.content} to ${task.targetId}`, error);
        }
      }
    } catch (error) {
      ctx.logger('stock').error('定时广播逻辑执行出错', error);
    }
  }, 30000);

  // 检查用户或频道是否在特定指令的黑名单中
  function isUserInSpecificBlacklist(session, commandName: string) {
    const userId = session.userId;
    const channelId = session.channelId;
    
    // 检查特定指令的用户黑名单
    switch(commandName) {
      case '活跃市值':
        if (config.activeMarketCapBlacklist?.includes(userId)) {
          return true;
        }
        break;
      case '异动':
        if (config.stockAlertBlacklist?.includes(userId)) {
          return true;
        }
        break;
      case '涨停看板':
        if (config.limitUpBoardBlacklist?.includes(userId)) {
          return true;
        }
        break;
      case '跌停看板':
        if (config.limitDownBoardBlacklist?.includes(userId)) {
          return true;
        }
        break;
      case '选股':
        if (config.stockSelectionBlacklist?.includes(userId)) {
          return true;
        }
        break;
      case '骑':
        if (config.rideBlacklist?.includes(userId)) {
          return true;
        }
        break;
    }
    
    // 检查特定指令的频道黑名单
    switch(commandName) {
      case '活跃市值':
        if (config.activeMarketCapChannelBlacklist?.includes(channelId)) {
          return true;
        }
        break;
      case '异动':
        if (config.stockAlertChannelBlacklist?.includes(channelId)) {
          return true;
        }
        break;
      case '涨停看板':
        if (config.limitUpBoardChannelBlacklist?.includes(channelId)) {
          return true;
        }
        break;
      case '跌停看板':
        if (config.limitDownBoardChannelBlacklist?.includes(channelId)) {
          return true;
        }
        break;
      case '选股':
        if (config.stockSelectionChannelBlacklist?.includes(channelId)) {
          return true;
        }
        break;
      case '骑':
        if (config.rideChannelBlacklist?.includes(channelId)) {
          return true;
        }
        break;
    }
    
    // 检查全局用户黑名单
    if (config.allCommandsBlacklist?.includes(userId)) {
      return true;
    }
    
    // 检查全局频道黑名单
    if (config.allCommandsChannelBlacklist?.includes(channelId)) {
      return true;
    }
    
    return false;
  }

  // 监听活跃市值命令
  ctx.command('活跃市值', '获取活跃市值数据')
    .action(async ({ session }) => {
      if (isUserInSpecificBlacklist(session, '活跃市值')) {
        return '您已被加入黑名单，无法使用此功能。';
      }
      
      try {
        // 使用Koishi的HTTP服务发起请求获取数据
        // 根据测试，API返回的是文本格式而非JSON
        const responseText = await ctx.http.get('http://stock.svip886.com/api/indexes', { responseType: 'text' })
        
        // 直接返回API返回的数据
        return `📊 指数看板：\n\n${responseText}`
      } catch (error) {
        console.error('获取活跃市值数据失败:', error)
        return '获取活跃市值数据失败，请稍后重试。'
      }
    })

  // 监听异动命令，接受股票代码参数
  ctx.command('异动 <stockCode:text>', '获取指定股票的异动分析数据')
    .action(async ({ session }, stockCode) => {
      if (isUserInSpecificBlacklist(session, '异动')) {
        return '您已被加入黑名单，无法使用此功能。';
      }
      
      if (!stockCode) {
        return '请输入股票代码，格式：异动 [股票代码]'
      }
      
      try {
        // 使用Koishi的HTTP服务发起请求获取数据
        const responseText = await ctx.http.get(`http://stock.svip886.com/api/analyze?code=${stockCode}`, { responseType: 'text' })
        
        // 直接返回API返回的数据
        return `📈 股票 ${stockCode} 异动分析：\n\n${responseText}`
      } catch (error) {
        console.error('获取股票异动数据失败:', error)
        return `获取股票 ${stockCode} 异动数据失败，请稍后重试。`
      }
    })

  // 监听涨停看板命令
  ctx.command('涨停看板', '获取涨停看板图片')
    .action(async ({ session }) => {
      if (isUserInSpecificBlacklist(session, '涨停看板')) {
        return '您已被加入黑名单，无法使用此功能。';
      }
      
      try {
        // 使用Koishi的HTTP服务下载图片
        const imageUrl = 'http://stock.svip886.com/api/limit_up.png';
        
        // 获取图片的Buffer数据
        const imageBuffer = await ctx.http.get(imageUrl, { responseType: 'arraybuffer' });
        
        // 将Buffer转换为Base64编码
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        
        // 返回图片
        return `<img src="data:image/png;base64,${base64Image}" />`;
      } catch (error) {
        console.error('获取涨停看板图片失败:', error);
        return '获取涨停看板图片失败，请稍后重试。';
      }
    });

  // 监听跌停看板命令
  ctx.command('跌停看板', '获取跌停看板图片')
    .action(async ({ session }) => {
      if (isUserInSpecificBlacklist(session, '跌停看板')) {
        return '您已被加入黑名单，无法使用此功能。';
      }
      
      try {
        // 使用Koishi的HTTP服务下载图片
        const imageUrl = 'http://stock.svip886.com/api/limit_down.png';
        
        // 获取图片的Buffer数据
        const imageBuffer = await ctx.http.get(imageUrl, { responseType: 'arraybuffer' });
        
        // 将Buffer转换为Base64编码
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        
        // 返回图片
        return `<img src="data:image/png;base64,${base64Image}" />`;
      } catch (error) {
        console.error('获取跌停看板图片失败:', error);
        return '获取跌停看板图片失败，请稍后重试。';
      }
    });

  // 监听选股命令
  ctx.command('选股 <strategy:text>', '根据指定策略选股（支持策略：N型、填坑、少妇、突破、补票、少妇pro）')
    .action(async ({ session }, strategy) => {
      if (isUserInSpecificBlacklist(session, '选股')) {
        return '您已被加入黑名单，无法使用此功能。';
      }
      
      if (!strategy) {
        return '请输入选股策略，格式：选股 [策略名称或编号]\n支持的策略：N型(1)、填坑(2)、少妇(3)、突破(4)、补票(5)、少妇pro(6)';
      }
      
      // 映射策略名称到API端点
      const strategyMap = {
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
        '6': 'young_woman_pro',
      };
      
      const apiStrategy = strategyMap[strategy.trim()];
      
      if (!apiStrategy) {
        return `不支持的选股策略：${strategy}\n支持的策略：N型(1)、填坑(2)、少妇(3)、突破(4)、补票(5)、少妇pro(6)`;
      }
      
      try {
        // 使用Koishi的HTTP服务发起请求获取数据
        const apiUrl = `http://stock.svip886.com/api/dyq_select/${apiStrategy}`;
        const responseText = await ctx.http.get(apiUrl, { responseType: 'text' });
        
        // 直接返回API返回的数据
        return `选股策略【${strategy}】结果：\n\n${responseText}`;
      } catch (error) {
        console.error('获取选股数据失败:', error);
        return `获取【${strategy}】选股数据失败，请稍后重试。`;
      }
    });

  // 监听骑命令
  ctx.command('骑', '获取骑图片')
    .action(async ({ session }) => {
      if (isUserInSpecificBlacklist(session, '骑')) {
        return '您已被加入黑名单，无法使用此功能。';
      }
      
      try {
        // 读取本地图片文件并转换为base64
        const fs = require('fs').promises;
        const path = require('path');
        
        // 构建图片的绝对路径
        const imagePath = path.resolve(__dirname, '../images/qi.jpeg');
        
        // 读取图片文件
        const imageData = await fs.readFile(imagePath);
        
        // 将图片数据转换为base64编码
        const base64Image = imageData.toString('base64');
        
        // 返回base64编码的图片
        return `<img src="data:image/jpeg;base64,${base64Image}" />`;
      } catch (error) {
        console.error('获取骑图片失败:', error);
        return '获取骑图片失败，请稍后重试。';
      }
    });

  // 使用中间件方式监听特定关键词（作为备用方案）
  ctx.middleware(async (session, next) => {
    const content = session.content?.trim();
    
    if (content === '活跃市值') {
      if (isUserInSpecificBlacklist(session, '活跃市值')) {
        return '您已被加入黑名单，无法使用此功能。';
      }
      
      try {
        // 使用Koishi的HTTP服务发起请求获取数据
        const responseText = await ctx.http.get('http://stock.svip886.com/api/indexes', { responseType: 'text' })
        
        // 直接返回API返回的数据
        return `📊 指数看板：\n\n${responseText}`
      } catch (error) {
        console.error('获取活跃市值数据失败:', error)
        return '获取活跃市值数据失败，请稍后重试。'
      }
    } else if (content?.startsWith('异动 ')) {
      if (isUserInSpecificBlacklist(session, '异动')) {
        return '您已被加入黑名单，无法使用此功能。';
      }
      
      // 解析股票代码
      const match = content.match(/^异动\s+(.+)$/);
      if (match) {
        const stockCode = match[1].trim();
        
        try {
          // 使用Koishi的HTTP服务发起请求获取数据
          const responseText = await ctx.http.get(`http://stock.svip886.com/api/analyze?code=${stockCode}`, { responseType: 'text' })
          
          // 直接返回API返回的数据
          return `📈 异动分析：\n\n${responseText}`
        } catch (error) {
          console.error('获取股票异动数据失败:', error)
          return `获取股票 ${stockCode} 异动数据失败，请稍后重试。`
        }
      }
    } else if (content === '涨停看板') {
      if (isUserInSpecificBlacklist(session, '涨停看板')) {
        return '您已被加入黑名单，无法使用此功能。';
      }
      
      try {
        // 使用Koishi的HTTP服务下载图片
        const imageUrl = 'http://stock.svip886.com/api/limit_up.png';
        
        // 获取图片的Buffer数据
        const imageBuffer = await ctx.http.get(imageUrl, { responseType: 'arraybuffer' });
        
        // 将Buffer转换为Base64编码
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        
        // 返回图片
        return `<img src="data:image/png;base64,${base64Image}" />`;
      } catch (error) {
        console.error('获取涨停看板图片失败:', error);
        return '获取涨停看板图片失败，请稍后重试。';
      }
    } else if (content === '跌停看板') {
      if (isUserInSpecificBlacklist(session, '跌停看板')) {
        return '您已被加入黑名单，无法使用此功能。';
      }
      
      try {
        // 使用Koishi的HTTP服务下载图片
        const imageUrl = 'http://stock.svip886.com/api/limit_down.png';
        
        // 获取图片的Buffer数据
        const imageBuffer = await ctx.http.get(imageUrl, { responseType: 'arraybuffer' });
        
        // 将Buffer转换为Base64编码
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        
        // 返回图片
        return `<img src="data:image/png;base64,${base64Image}" />`;
      } catch (error) {
        console.error('获取跌停看板图片失败:', error);
        return '获取跌停看板图片失败，请稍后重试。';
      }
    } else if (content?.startsWith('选股 ')) {
      if (isUserInSpecificBlacklist(session, '选股')) {
        return '您已被加入黑名单，无法使用此功能。';
      }
      
      // 解析选股策略
      const match = content.match(/^选股\s+(.+)$/);
      if (match) {
        const strategy = match[1].trim();
        
      // 映射策略名称到API端点
      const strategyMap = {
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
        '6': 'young_woman_pro',
      };
      
      const apiStrategy = strategyMap[strategy];
      
      if (!apiStrategy) {
        return `不支持的选股策略：${strategy}\n支持的策略：N型(1)、填坑(2)、少妇(3)、突破(4)、补票(5)、少妇pro(6)`;
      }
        
        try {
          // 使用Koishi的HTTP服务发起请求获取数据
          const apiUrl = `http://stock.svip886.com/api/dyq_select/${apiStrategy}`;
          const responseText = await ctx.http.get(apiUrl, { responseType: 'text' });
          
          // 直接返回API返回的数据
          return `选股策略【${strategy}】结果：\n\n${responseText}`;
        } catch (error) {
          console.error('获取选股数据失败:', error);
          return `获取【${strategy}】选股数据失败，请稍后重试。`;
        }
      }
    } else if (content === '骑') {
      if (isUserInSpecificBlacklist(session, '骑')) {
        return '您已被加入黑名单，无法使用此功能。';
      }
      
      try {
        // 读取本地图片文件并转换为base64
        const fs = require('fs').promises;
        const path = require('path');
        
        // 构建图片的绝对路径
        const imagePath = path.resolve(__dirname, '../images/qi.jpeg');
        
        // 读取图片文件
        const imageData = await fs.readFile(imagePath);
        
        // 将图片数据转换为base64编码
        const base64Image = imageData.toString('base64');
        
        // 返回base64编码的图片
        return `<img src="data:image/jpeg;base64,${base64Image}" />`;
      } catch (error) {
        console.error('获取骑图片失败:', error);
        return '获取骑图片失败，请稍后重试。';
      }
    }
    
    return next()
  })
}