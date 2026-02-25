import { Context, Schema } from 'koishi'

export interface BroadcastTask {
  times: string
  type: 'private' | 'channel'
  targetIds: string
  content: '活跃市值' | '涨停看板' | '跌停看板'
}

export interface Config {
  enableDebugLog?: boolean
  allCommandsBlacklist?: string[]
  activeMarketCapBlacklist?: string[]
  stockAlertBlacklist?: string[]
  limitUpBoardBlacklist?: string[]
  limitDownBoardBlacklist?: string[]
  stockSelectionBlacklist?: string[]
  rideBlacklist?: string[]
  allCommandsChannelBlacklist?: string[]
  activeMarketCapChannelBlacklist?: string[]
  stockAlertChannelBlacklist?: string[]
  limitUpBoardChannelBlacklist?: string[]
  limitDownBoardChannelBlacklist?: string[]
  stockSelectionChannelBlacklist?: string[]
  rideChannelBlacklist?: string[]
  broadcastTasks?: BroadcastTask[]
  //心法抽卡配置
  enableHeartMethod?: boolean
  heartMethodBlacklist?: string[]
  heartMethodChannelBlacklist?: string[]
}

const BroadcastTask: Schema<BroadcastTask> = Schema.object({
  times: Schema.string().description('触发时间 (逗号分隔的列表, 推荐格式: HH:mm,HH:mm)').default('09:30'),
  type: Schema.union([
    Schema.const('private').description('私人消息'),
    Schema.const('channel').description('频道消息'),
  ]).default('channel').description('消息类型'),
  targetIds: Schema.string().description('目标ID列表 (逗号分隔的列表)').default(''),
  content: Schema.union([
    Schema.const('活跃市值'),
    Schema.const('涨停看板'),
    Schema.const('跌停看板'),
  ]).default('活跃市值').description('广播内容'),
})

export const Config: Schema<Config> = Schema.object({
  // --- 系统设置 ---
  enableDebugLog: Schema.boolean().description('启用调试日志').default(false),
  
  // --- 用户黑名单 ---
  allCommandsBlacklist: Schema.array(String).description('全部指令黑名单用户ID'),
  activeMarketCapBlacklist: Schema.array(String).description('活跃市值指令黑名单用户ID'),
  stockAlertBlacklist: Schema.array(String).description('异动指令黑名单用户ID'),
  limitUpBoardBlacklist: Schema.array(String).description('涨停看板指令黑名单用户ID'),
  limitDownBoardBlacklist: Schema.array(String).description('跌停看板指令黑名单用户ID'),
  stockSelectionBlacklist: Schema.array(String).description('选股指令黑名单用户ID'),
  rideBlacklist: Schema.array(String).description('骑指令黑名单用户ID'),
  heartMethodBlacklist: Schema.array(String).description('心法抽卡指令黑名单用户ID'),
  
  // --- 频道黑名单 ---
  allCommandsChannelBlacklist: Schema.array(String).description('全部指令黑名单频道ID'),
  activeMarketCapChannelBlacklist: Schema.array(String).description('活跃市值指令黑名单频道ID'),
  stockAlertChannelBlacklist: Schema.array(String).description('异动指令黑名单频道ID'),
  limitUpBoardChannelBlacklist: Schema.array(String).description('涨停看板指令黑名单频道ID'),
  limitDownBoardChannelBlacklist: Schema.array(String).description('跌停看板指令黑名单频道ID'),
  stockSelectionChannelBlacklist: Schema.array(String).description('选股指令黑名单频道ID'),
  rideChannelBlacklist: Schema.array(String).description('骑指令黑名单频道ID'),
  heartMethodChannelBlacklist: Schema.array(String).description('心法抽卡指令黑名单频道ID'),
  
  // --- 定时广播 ---
  broadcastTasks: Schema.array(BroadcastTask).description('定时广播任务列表'),
  
  // --- 心法抽卡 ---
  enableHeartMethod: Schema.boolean().description('启用心法抽卡功能').default(true),
})

export function apply(ctx: Context, config: Config) {
  const logger = ctx.logger('stock');
  
  //心法数据直接嵌入（避免文件编码问题）
  const HEART_METHODS = [
    {code: 'M01', text: '谋定而后动。', file: 'M01.mp3'},
    {code: 'M02', text: '顺大势，逆小势', file: 'M02.mp3'},
    {code: 'M03A', text: '上联风吹哪页读哪页，下联是哪页难读撕哪页，横批是什么？去你大爷', file: 'M03A.mp3'},
    {code: 'M03B', text: '风吹哪页读哪页，记住，一切都是最好安排', file: 'M03B.mp3'},
    {code: 'M04', text: '你越想找好的，你越是接盘', file: 'M04.mp3'},
    {code: 'M05', text: '就是想赚大钱都是逆人性的', file: 'M05.mp3'},
    {code: 'M06', text: '一定要学会屏蔽掉这些噪音，同时建立自己的一个非常良好的心态', file: 'M06.mp3'},
    {code: 'M07', text: '当你觉得舒服的时候，恰恰是风险最大的时刻', file: 'M07.mp3'},
    {code: 'M08', text: '投资就是反人性的，就是你要学会守株待兔', file: 'M08.mp3'},
    {code: 'M09', text: '365 天看懂哪天做哪天', file: 'M09.mp3'},
    {code: 'M10', text: '所有挣钱的过程，等待的时间都是很煎熬的', file: 'M10.mp3'},
    {code: 'M11', text: '不追、不动、不慌、不乱摸', file: 'M11.mp3'},
    {code: 'M12', text: '股市里边赚的是什么钱？大富翁赚的什么钱？就是熬人的钱', file: 'M12.mp3'},
    {code: 'M13A', text: '曼城阵容拿住不动', file: 'M13A.mp3'},
    {code: 'M14', text: '赚了钱了拿出来消费', file: 'M14.mp3'},
    {code: 'M15', text: '与国家同在，只输时间不输钱。', file: 'M15.mp3'},
    {code: 'M16', text: '市场没有证明你是对的时候，你就是错了', file: 'M16.mp3'},
    {code: 'M17', text: '在这个市场里边，你不亏钱才叫赚钱，而不是不赚钱叫亏', file: 'M17.mp3'},
    {code: 'M18', text: '早上涨晚上涨早晚上涨,早下跌晚下跌早晚下跌', file: 'M18.mp3'},
    {code: 'M19', text: '现在赚钱还是以后赚大钱', file: 'M19.mp3'},
    {code: 'M20', text: '只有成功才是成功他妈', file: 'M20.mp3'},
    {code: 'M21', text: '永远不要对你期待的事情抱有不切实际的幻想', file: 'M21.mp3'},
    {code: 'M22B', text: '王德峰教授说过，如果一个男人过了四十岁还不相信有命的话，此人悟性极差', file: 'M22B.mp3'},
    {code: 'M23', text: '一定要放飞，把钱揣兜里', file: 'M23.mp3'},
    {code: 'M24A', text: '大 A 踏不了空、扽起来就卖！', file: 'M24A.mp3'},
    {code: 'M25', text: '不用害怕，怕你就会输一辈子', file: 'M25.mp3'},
    {code: 'M26', text: '一派胡言啊', file: 'M26.mp3'},
    {code: 'M27', text: '在这个世界上啊，该是你的绝逼是你的', file: 'M27.mp3'},
    {code: 'M28C', text: '踏踏实实的，别着急啊', file: 'M28C.mp3'},
    {code: 'M29', text: '你怎么认知慢就是快，这两个最重要的就是什么，什么时候慢，什么时候快', file: 'M29.mp3'},
    {code: 'M30', text: '能听懂就听，听不懂就反复听', file: 'M30.mp3'},
    {code: 'M31', text: '只选最美，只买最强，只拿最硬。', file: 'M31.mp3'},
    {code: 'M32', text: '别小路过载，也别熵增', file: 'M32.mp3'},
    {code: 'M33', text: '不要对票有感情，谁是县长不重要，重要的是我要当县长夫人', file: 'M33.mp3'},
    {code: 'M34', text: '不要猜，心无所住，物来则应，过去不留', file: 'M34.mp3'},
    {code: 'M35', text: '一切皆有可能，记住了吗？我们要做的是什么？是应对', file: 'M35.mp3'},
    {code: 'M36', text: '要信早信', file: 'M36.mp3'},
    {code: 'M37', text: '为你的知行合一账户充值。', file: 'M37.mp3'},
    {code: 'M38', text: '先慢后快，越来越快，坚持做对的事儿，方能行稳致远。世界上怕就怕认真二字', file: 'M38.mp3'},
    {code: 'M39', text: '拿不住就卖。卖完之后你的世界安静了，你的心就静下来了，你可以更多的去学习', file: 'M39.mp3'},
    {code: 'M40', text: '莫道今年春将近，明年春色倍还人', file: 'M40.mp3'},
    {code: 'M41', text: '市场总会奖励有信仰的人', file: 'M41.mp3'},
    {code: 'M42', text: '心无杂念，知行合一', file: 'M42.mp3'},
    {code: 'M43', text: '不要因为正确的决定带来坏结果就改变它', file: 'M43.mp3'},
    {code: 'M44', text: '完美图形干错也要干', file: 'M44.mp3'},
    {code: 'M45', text: '时刻要充满敬畏之心，如履薄冰', file: 'M45.mp3'},
    {code: 'M46A', text: '戒骄戒躁', file: 'M46A.mp3'},
    {code: 'M47', text: '物极必反', file: 'M47.mp3'},
    {code: 'M48', text: '一切以盘面为准', file: 'M48.mp3'},
    {code: 'M49', text: '积小胜为大胜', file: 'M49.mp3'},
    {code: 'M50', text: '闷声发大财', file: 'M50.mp3'},
    {code: 'M51', text: '只英雄救美，不锦上添花', file: 'M51.mp3'},
    {code: 'M52B', text: '就莫名其妙，人生就是莫名其妙', file: 'M52B.mp3'},
    {code: 'M53', text: '赚钱的票别做亏，以及设好止损', file: 'M53.mp3'},
    {code: 'M54', text: '就是你能赚多少钱不知道，没人知道，但是你能亏多少钱，那一定是你自己能决定的', file: 'M54.mp3'},
    {code: 'M55', text: '留得青山在，一定有下一个小米', file: 'M55.mp3'},
    {code: 'M56', text: '不要抱有偏见', file: 'M56.mp3'},
    {code: 'M57', text: '散户最重要的是心态，是不要和这个市场杠，要从自身找原因', file: 'M57.mp3'},
  ];
  
  let heartMethods = HEART_METHODS;
  
  logger.info(`[心法抽卡] 直接加载内置心法数据，共 ${heartMethods.length} 条`);
  
  // 待重试任务队列
  interface RetryTask {
    task: BroadcastTask;
    originalTime: string;
    retryCount: number;
    lastAttemptTimestamp: number;
  }
  const retryQueue: RetryTask[] = [];

  // 插件启动日志
  logger.info('stock 插件已加载');
  logger.info(`当前配置: broadcastTasks=${config.broadcastTasks?.length || 0} 个任务`);
  if (config.broadcastTasks && config.broadcastTasks.length > 0) {
    config.broadcastTasks.forEach((task, idx) => {
      logger.info(`任务 ${idx + 1}: times=${task.times}, type=${task.type}, targetIds=${task.targetIds}, content=${task.content}`);
    });
  }

  // 核心广播执行函数
  async function performBroadcast(task: BroadcastTask, isRetry = false) {
    const label = isRetry ? '[重试广播]' : '[初始广播]';
    try {
      if (!task.targetIds || typeof task.targetIds !== 'string') {
        logger.warn(`${label} 任务配置不完整: targetIds 字段无效`);
        return false;
      }

      const targetIds = task.targetIds.split(/[，,]/).map(id => id.trim()).filter(id => id);
      if (targetIds.length === 0) {
        logger.warn(`${label} 任务目标列表为空: ${task.content}`);
        return false;
      }

      logger.info(`${label} 正在执行: ${task.content} -> ${targetIds.join(',')} (${task.type})`);
      let message = '';
      
      // 1. 获取内容
      if (task.content === '活跃市值') {
        try {
          const responseText = await ctx.http.get('http://stock.svip886.com/api/indexes', { responseType: 'text' });
          message = `📊 定时广播 - 指数看板：\n\n${responseText}`;
        } catch (apiErr) {
          logger.error(`${label} 获取活跃市值 API 失败`, apiErr);
          return false;
        }
      } else if (task.content === '涨停看板' || task.content === '跌停看板') {
        try {
          const apiType = task.content === '涨停看板' ? 'limit_up' : 'limit_down';
          const imageUrl = `http://stock.svip886.com/api/${apiType}.png`;
          const imageBuffer = await ctx.http.get(imageUrl, { responseType: 'arraybuffer' });
          const base64Image = Buffer.from(imageBuffer).toString('base64');
          message = `🔔 定时广播 - ${task.content}：\n<img src="data:image/png;base64,${base64Image}" />`;
        } catch (apiErr) {
          logger.error(`${label} 获取${task.content}图片 API 失败`, apiErr);
          return false;
        }
      }

      if (!message) return false;

      // 2. 发送消息
      const bot = ctx.bots.find(b => (b.status as any) === 'online' || (b.status as any) === 1) || ctx.bots[0];
      if (!bot) {
        logger.error(`${label} 无可用机器人实例`);
        return false;
      }

      let allSuccess = true;
      for (const targetId of targetIds) {
        try {
          if (task.type === 'private') {
            await bot.sendPrivateMessage(targetId, message);
          } else {
            await bot.sendMessage(targetId, message);
          }
        } catch (err) {
          logger.error(`${label} 发送失败 (${targetId}): ${err.message}`);
          allSuccess = false;
        }
      }
      return allSuccess;
    } catch (error) {
      logger.error(`${label} 执行过程发生严重错误`, error);
      return false;
    }
  }

  // 获取任务的下一个执行时间点
  function getNextScheduledTime(task: BroadcastTask, currentTime: string): string | null {
    const times = task.times.split(/[，,]/).map(s => {
      let time = s.trim();
      if (/^\d:\d{2}$/.test(time)) time = '0' + time;
      return time;
    }).sort();
    
    const currentIndex = times.indexOf(currentTime);
    if (currentIndex === -1) return times[0]; // 如果当前时间不在列表里，假设下一个是第一个
    return times[(currentIndex + 1) % times.length];
  }
  
  // 定时任务逻辑
  let lastCheckedMinute = '';

  ctx.setInterval(async () => {
    const now = new Date();
    const nowTimestamp = now.getTime();
    const chinaTimeStr = now.toLocaleTimeString('zh-CN', { 
      timeZone: 'Asia/Shanghai', 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    const currentTime = chinaTimeStr.replace('：', ':');
    
    if (config.enableDebugLog && currentTime !== lastCheckedMinute) {
      logger.info(`[定时任务检查] 当前时间: ${currentTime} (上海时区)`);
    }

    // --- 1. 处理重试队列 ---
    for (let i = retryQueue.length - 1; i >= 0; i--) {
      const item = retryQueue[i];
      
      // 检查是否达到1分钟间隔
      if (nowTimestamp - item.lastAttemptTimestamp < 60000) continue;

      // 检查是否超过了下次执行时间
      const nextTime = getNextScheduledTime(item.task, item.originalTime);
      // 如果当前时间已经达到了该任务的下一个预定时间，或者已经跨天了，则取消重试
      if (nextTime && (currentTime === nextTime || (currentTime > nextTime && item.originalTime < nextTime))) {
        logger.warn(`[重试取消] 任务 ${item.task.content} (${item.originalTime}) 已过期或达到下个周期`);
        retryQueue.splice(i, 1);
        continue;
      }

      item.retryCount++;
      item.lastAttemptTimestamp = nowTimestamp;
      
      logger.info(`[开始重试] 任务 ${item.task.content} (原定于 ${item.originalTime}), 第 ${item.retryCount}/3 次重试`);
      const success = await performBroadcast(item.task, true);
      
      if (success) {
        logger.info(`[重试成功] 任务 ${item.task.content} 已成功补发`);
        retryQueue.splice(i, 1);
      } else if (item.retryCount >= 3) {
        logger.error(`[重试失败] 任务 ${item.task.content} 已达到最大重试次数，放弃`);
        retryQueue.splice(i, 1);
      }
    }
    
    // --- 2. 处理初始任务 ---
    if (currentTime === lastCheckedMinute) return;
    if (!config.broadcastTasks || config.broadcastTasks.length === 0) return;

    const activeTasks = config.broadcastTasks.filter(t => {
      if (!t.times || typeof t.times !== 'string') return false;
      const times = t.times.split(/[，,]/).map(s => {
        let time = s.trim();
        if (/^\d:\d{2}$/.test(time)) time = '0' + time;
        return time;
      }).filter(s => s);
      return times.includes(currentTime);
    });

    if (activeTasks.length === 0) {
      if (currentTime !== lastCheckedMinute) lastCheckedMinute = currentTime;
      return;
    }

    lastCheckedMinute = currentTime;
    logger.info(`[任务触发] 命中 ${activeTasks.length} 个广播任务 (时间: ${currentTime})`);

    try {
      const shanghaiDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
      const isWeekend = (shanghaiDate.getDay() === 0 || shanghaiDate.getDay() === 6);
      const year = shanghaiDate.getFullYear();
      const month = (shanghaiDate.getMonth() + 1).toString().padStart(2, '0');
      const day = shanghaiDate.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      let tradingDay = !isWeekend;
      try {
        const holidayData = await ctx.http.get(`https://timor.tech/api/holiday/info/${dateStr}`);
        if (holidayData && typeof holidayData === 'object' && holidayData.type) {
          const typeCode = holidayData.type.type;
          tradingDay = (typeCode === 0 || typeCode === 3);
        }
      } catch (e) {
        logger.warn(`节假日API请求失败: ${e.message}`);
      }

      if (!tradingDay) {
        logger.info(`[定时任务跳过] ${dateStr} 非交易日`);
        return;
      }

      for (const task of activeTasks) {
        const success = await performBroadcast(task);
        if (!success) {
          logger.warn(`[任务入队] 任务 ${task.content} 执行失败，加入重试队列`);
          retryQueue.push({
            task,
            originalTime: currentTime,
            retryCount: 0,
            lastAttemptTimestamp: nowTimestamp
          });
        }
      }
    } catch (error) {
      logger.error('定时广播逻辑执行出错', error);
    }
  }, 1000);

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
      case '心法抽卡':
        if (config.heartMethodBlacklist?.includes(userId)) {
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
      case '心法抽卡':
        if (config.heartMethodChannelBlacklist?.includes(channelId)) {
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
        return;
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
        return;
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
        return;
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
        return;
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
        return;
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
        return;
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

  // 心法抽卡命令
  ctx.command('心法抽卡', '随机抽取一条交易心法')
    .action(async ({ session }) => {
      logger.info(`[心法抽卡] 收到命令请求，当前心法数据量: ${heartMethods.length}`);
      
      // 检查功能是否启用
      if (!config.enableHeartMethod) {
        logger.warn('[心法抽卡] 功能被禁用');
        return '心法抽卡功能未启用';
      }
      
      // 检查黑名单
      if (isUserInSpecificBlacklist(session, '心法抽卡')) {
        logger.info('[心法抽卡] 用户在黑名单中，静默处理');
        return;
      }
      
      // 检查是否有心法数据
      if (heartMethods.length === 0) {
        logger.error('[心法抽卡] 心法数据为空');
        return '暂无心法数据，请联系管理员';
      }
      
      try {
        // 随机选择一个心法
        const randomIndex = Math.floor(Math.random() * heartMethods.length);
        const selectedMethod = heartMethods[randomIndex];
        
        logger.info(`[心法抽卡] 用户 ${session?.userId || '未知'} 抽中: ${selectedMethod.code} - ${selectedMethod.text}`);
        
        // 读取音频文件
        const fs = require('fs');
        const path = require('path');
        const audioPath = path.resolve(__dirname, `../audio/${selectedMethod.file}`);
        
        logger.info(`[心法抽卡] 尝试读取音频文件: ${audioPath}`);
        
        if (!fs.existsSync(audioPath)) {
          logger.warn(`[心法抽卡] 音频文件不存在: ${audioPath}`);
          // 如果音频文件不存在，只返回文本
          return `🃏 心法抽卡\n\n${selectedMethod.text}\n\n(音频文件缺失: ${selectedMethod.file})`;
        }
        
        // 读取音频文件并转换为base64
        const audioData = fs.readFileSync(audioPath);
        const base64Audio = audioData.toString('base64');
        
        logger.info(`[心法抽卡] 音频文件读取成功，大小: ${audioData.length} 字节`);
        
        // 返回音频消息
        const response = `<audio src="data:audio/mp3;base64,${base64Audio}" />${selectedMethod.text}`;
        logger.info('[心法抽卡] 成功生成响应消息');
        return response;
        
      } catch (error) {
        logger.error('[心法抽卡] 执行失败:', error);
        logger.error('[心法抽卡] 错误堆栈:', error.stack);
        return '心法抽卡失败，请稍后重试';
      }
    });

  // 使用中间件方式监听特定关键词（作为备用方案）
  ctx.middleware(async (session, next) => {
    const content = session.content?.trim();
    
    if (content === '活跃市值') {
      if (isUserInSpecificBlacklist(session, '活跃市值')) {
        return;
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
        return;
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
        return;
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
        return;
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
        return;
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
        return;
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