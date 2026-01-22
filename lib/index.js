"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
exports.apply = apply;
const koishi_1 = require("koishi");
exports.Config = koishi_1.Schema.object({});
function apply(ctx) {
    // 监听活跃市值命令
    ctx.command('活跃市值', '获取活跃市值数据')
        .action(async ({ session }) => {
        try {
            // 使用Koishi的HTTP服务发起请求获取数据
            // 根据测试，API返回的是文本格式而非JSON
            const responseText = await ctx.http.get('http://stock.svip886.com/api/indexes', { responseType: 'text' });
            // 直接返回API返回的数据
            return `📊 活跃市值数据：\n\n${responseText}`;
        }
        catch (error) {
            console.error('获取活跃市值数据失败:', error);
            return '获取活跃市值数据失败，请稍后重试。';
        }
    });
    // 监听异动命令，接受股票代码参数
    ctx.command('异动 <stockCode:text>', '获取指定股票的异动分析数据')
        .action(async ({ session }, stockCode) => {
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
    // 使用中间件方式监听特定关键词（作为备用方案）
    ctx.middleware(async (session, next) => {
        const content = session.content?.trim();
        if (content === '活跃市值') {
            try {
                // 使用Koishi的HTTP服务发起请求获取数据
                const responseText = await ctx.http.get('http://stock.svip886.com/api/indexes', { responseType: 'text' });
                // 直接返回API返回的数据
                return `📊 活跃市值数据：\n\n${responseText}`;
            }
            catch (error) {
                console.error('获取活跃市值数据失败:', error);
                return '获取活跃市值数据失败，请稍后重试。';
            }
        }
        else if (content?.startsWith('异动 ')) {
            // 解析股票代码
            const match = content.match(/^异动\s+(.+)$/);
            if (match) {
                const stockCode = match[1].trim();
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
            }
        }
        return next();
    });
}
