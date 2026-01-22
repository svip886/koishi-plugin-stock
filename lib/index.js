"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
exports.apply = apply;
const koishi_1 = require("koishi");
exports.Config = koishi_1.Schema.object({
    allCommandsBlacklist: koishi_1.Schema.array(String).description('全部指令黑名单用户ID'),
    activeMarketCapBlacklist: koishi_1.Schema.array(String).description('活跃市值指令黑名单用户ID'),
    stockAlertBlacklist: koishi_1.Schema.array(String).description('异动指令黑名单用户ID'),
    limitUpBoardBlacklist: koishi_1.Schema.array(String).description('涨停看板指令黑名单用户ID'),
    stockSelectionBlacklist: koishi_1.Schema.array(String).description('选股指令黑名单用户ID'),
    rideBlacklist: koishi_1.Schema.array(String).description('骑指令黑名单用户ID'),
    allCommandsChannelBlacklist: koishi_1.Schema.array(String).description('全部指令黑名单频道ID'),
    activeMarketCapChannelBlacklist: koishi_1.Schema.array(String).description('活跃市值指令黑名单频道ID'),
    stockAlertChannelBlacklist: koishi_1.Schema.array(String).description('异动指令黑名单频道ID'),
    limitUpBoardChannelBlacklist: koishi_1.Schema.array(String).description('涨停看板指令黑名单频道ID'),
    stockSelectionChannelBlacklist: koishi_1.Schema.array(String).description('选股指令黑名单频道ID'),
    rideChannelBlacklist: koishi_1.Schema.array(String).description('骑指令黑名单频道ID'),
});
function apply(ctx, config) {
    // 检查用户或频道是否在特定指令的黑名单中
    function isUserInSpecificBlacklist(session, commandName) {
        const userId = session.userId;
        const channelId = session.channelId;
        // 检查特定指令的用户黑名单
        switch (commandName) {
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
        switch (commandName) {
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
            const responseText = await ctx.http.get('http://stock.svip886.com/api/indexes', { responseType: 'text' });
            // 直接返回API返回的数据
            return `📊 指数看板：\n\n${responseText}`;
        }
        catch (error) {
            console.error('获取活跃市值数据失败:', error);
            return '获取活跃市值数据失败，请稍后重试。';
        }
    });
    // 监听异动命令，接受股票代码参数
    ctx.command('异动 <stockCode:text>', '获取指定股票的异动分析数据')
        .action(async ({ session }, stockCode) => {
        if (isUserInSpecificBlacklist(session, '异动')) {
            return '您已被加入黑名单，无法使用此功能。';
        }
        if (!stockCode) {
            return '请输入股票代码，格式：异动 [股票代码]';
        }
        try {
            // 使用Koishi的HTTP服务发起请求获取数据
            const responseText = await ctx.http.get(`http://stock.svip886.com/api/analyze?code=${stockCode}`, { responseType: 'text' });
            // 直接返回API返回的数据
            return `📈 股票 ${stockCode} 异动分析：\n\n${responseText}`;
        }
        catch (error) {
            console.error('获取股票异动数据失败:', error);
            return `获取股票 ${stockCode} 异动数据失败，请稍后重试。`;
        }
    });
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
        }
        catch (error) {
            console.error('获取涨停看板图片失败:', error);
            return '获取涨停看板图片失败，请稍后重试。';
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
        }
        catch (error) {
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
        }
        catch (error) {
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
                const responseText = await ctx.http.get('http://stock.svip886.com/api/indexes', { responseType: 'text' });
                // 直接返回API返回的数据
                return `📊 指数看板：\n\n${responseText}`;
            }
            catch (error) {
                console.error('获取活跃市值数据失败:', error);
                return '获取活跃市值数据失败，请稍后重试。';
            }
        }
        else if (content?.startsWith('异动 ')) {
            if (isUserInSpecificBlacklist(session, '异动')) {
                return '您已被加入黑名单，无法使用此功能。';
            }
            // 解析股票代码
            const match = content.match(/^异动\s+(.+)$/);
            if (match) {
                const stockCode = match[1].trim();
                try {
                    // 使用Koishi的HTTP服务发起请求获取数据
                    const responseText = await ctx.http.get(`http://stock.svip886.com/api/analyze?code=${stockCode}`, { responseType: 'text' });
                    // 直接返回API返回的数据
                    return `📈 异动分析：\n\n${responseText}`;
                }
                catch (error) {
                    console.error('获取股票异动数据失败:', error);
                    return `获取股票 ${stockCode} 异动数据失败，请稍后重试。`;
                }
            }
        }
        else if (content === '涨停看板') {
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
            }
            catch (error) {
                console.error('获取涨停看板图片失败:', error);
                return '获取涨停看板图片失败，请稍后重试。';
            }
        }
        else if (content?.startsWith('选股 ')) {
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
                }
                catch (error) {
                    console.error('获取选股数据失败:', error);
                    return `获取【${strategy}】选股数据失败，请稍后重试。`;
                }
            }
        }
        else if (content === '骑') {
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
            }
            catch (error) {
                console.error('获取骑图片失败:', error);
                return '获取骑图片失败，请稍后重试。';
            }
        }
        return next();
    });
}
