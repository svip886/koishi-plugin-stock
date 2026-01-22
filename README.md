# koishi-plugin-stock

一个Koishi插件，当用户发送"活跃市值"时自动获取股票市值数据并回复。

## 功能

- 用户发送"活跃市值"命令时，自动从 http://stock.svip886.com/api/indexes 获取数据并格式化显示
- 用户发送"异动 [股票代码]"命令时，自动从 http://stock.svip886.com/api/analyze?code=[股票代码] 获取指定股票的异动分析数据
- 自动格式化数据显示给用户

## 安装

```bash
npm install koishi-plugin-market-value
```

## 配置

此插件无需配置。

## 使用

在聊天中输入"活跃市值"即可获取最新的市值数据。