# 开发环境设置说明

## 前提条件

在开始开发之前，请确保您的系统已安装以下软件：

- Node.js (版本 16.x 或更高)
- npm (通常随 Node.js 一起安装)

## 安装依赖

首次运行项目前，请运行以下命令安装依赖：

```bash
npm install
```

## 构建项目

如需构建TypeScript代码，请运行：

```bash
npm run build
```

这会将 src/ 目录下的 TypeScript 文件编译到 lib/ 目录下。

## 安装到 Koishi

要将此插件安装到 Koishi 实例中：

1. 在 Koishi 控制台的插件页签中搜索 `koishi-plugin-stock`
2. 或使用 npm 安装：`npm install koishi-plugin-stock`
3. 在 Koishi 配置中启用此插件

## 开发模式

在开发过程中，您可以直接在 Koishi 项目中链接此插件进行测试：

```bash
npm link
# 然后在 Koishi 项目目录中运行
npm link koishi-plugin-market-value
```