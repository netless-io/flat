<p align="center">
    <img width="94" height="94" style="display: block;" src="/assets/flat-logo.svg">
</p>

<div align="center">
    <img alt="GitHub" src="https://img.shields.io/github/license/netless-io/flat?color=9cf&style=flat-square">
    <img alt="GitHub repo size" src="https://img.shields.io/github/repo-size/netless-io/flat?color=9cf&style=flat-square">
    <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/netless-io/flat?color=9cf&style=flat-square">
    <a target="_blank" href="https://github.com/netless-io/flat/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22">
        <img alt="GitHub issues by-label" src="https://img.shields.io/github/issues/netless-io/flat/good%20first%20issue?color=9cf&label=good%20first%20issue&style=flat-square">
    </a>
    <br>
    <a target="_blank" href="https://twitter.com/AgoraFlat">
    <img alt="Twitter URL" src="https://img.shields.io/badge/Twitter-AgoraFlat-9cf.svg?logo=twitter&style=flat-square">
    </a>
    <a target="_blank" href="https://github.com/netless-io/flat/issues/926">
        <img alt="Slack URL" src="https://img.shields.io/badge/Slack-AgoraFlat-9cf.svg?logo=slack&style=flat-square">
    </a>
</div>

<div align="center">
    <h1>Agora Flat</h1>
    <p>项目 flat 是 <a href="https://www.flat.apprtc.cn/">Agora Flat</a> 开源教室的 Web 端、Windows 客户端与 macOS 客户端。</p>
    <img src="/assets/flat-showcase.png">
</div>

## 特性

-   实时交互
    -   多功能互动白板
    -   实时音视频（RTC）通讯
    -   即时消息（RTM）聊天
-   登录方式
    -   微信
    -   GitHub
-   房间管理
    -   加入、创建、预定房间
    -   支持周期性房间
-   课堂录制回放
    -   白板信令回放
    -   音视频云录制回放
    -   群聊信令回放
-   多媒体课件云盘
-   屏幕共享

## 快速上手

你可以在没有服务端的情况下构建并运行 Flat 客户端。此仓库包含以下项目：

-   [Flat Electron 客户端](/desktop)
-   [Flat Web 客户端](/web)

### 安装

> 如果你还没有安装 `pnpm`：
>
> ```bash
> npm i -g pnpm
> ```

Clone 或者 fork 这个项目，在根目录执行：

```bash
pnpm i
```

### 构建并运行 Flat Electron 客户端

在仓库根目录运行以下命令：

```shell
pnpm start
```

你可以运行以下命令将项目打包成可执行文件：

-   项目根目录执行 `pnpm ship` 将根据当前系统打包。
-   或者项目根目录执行 `pnpm ship:mac` 或 `pnpm ship:win` 可针对指定的系统打包。

> 如果你因为网络问题导致无法下载 `electron`，可在项目目录新建: `.npmrc` 文件，并写入 `ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"` 内容。重新执行 `pnpm i` 即可。

```shell
pnpm i
```

### 构建并运行 Flat Web 客户端

在仓库根目录运行以下任意一个命令：

```shell
pnpm start:web
```

```shell
cd ./web/flat-web/ && pnpm start
```

在 Flat 中 UI 逻辑与业务逻辑分开开发。可以通过 [Storybook](#storybook) 快速查看与开发部分 UI。参考（[线上地址][flat-storybook]）或在项目根目录执行 `pnpm storybook` 在本地运行 Storybook。

## 相关项目

-   [Flat 安卓客户端][flat-android]
-   [Flat 服务端][flat-server]
-   [Flat 主页][flat-homepage]

## 参考文档

-   [发布版本说明](/docs/releases)
-   [环境变量值参考](/docs/env/README-zh.md)
-   [调试 Flat](/docs/debugging/README-zh.md)

## 贡献

编写代码很棒，但还有许多其他方法可以为项目做出有意义的贡献：

-   [改进文档](/docs/contributing/CONTRIBUTING-zh.md#改进文档)
-   [改善问题](/docs/contributing/CONTRIBUTING-zh.md#改善问题)
-   [对问题进行反馈](/docs/contributing/CONTRIBUTING-zh.md#对问题进行反馈)

有关此项目如何贡献的更多信息，请参阅 [CONTRIBUTING-zh.md](/docs/contributing/CONTRIBUTING-zh.md)

## 代码贡献者

感谢所有为 Flat 做出过贡献的人！

<a href="https://github.com/netless-io/flat/graphs/contributors"><img src="https://opencollective.com/agora-flat/contributors.svg?width=890&button=false"/></a>

## 免责声明

你可以将 Flat 用于商业用途但请注意我们不接受商业化需求定制与部署支持以及其它客户服务。如有相关需求请前往[灵动课堂](https://www.agora.io/cn/agora-flexible-classroom)。

本项目仅用于学习和交流使用，请遵守所在国的法律法规，切勿用于涉及政治、宗教、色情、犯罪等领域，一切违法后果请自负。

## 许可证

版权所有 Agora, Inc. 保留所有权利。

使用 [MIT 许可证](/LICENSE)

当使用 Flat 或其他 GitHub 徽标时，请务必遵循 [GitHub 徽标指南][github-logo]。

[join-flat-slack]: https://github.com/netless-io/flat/issues/926
[flat-homepage]: https://www.flat.apprtc.cn/#download
[flat-web]: https://web.flat.apprtc.cn/
[flat-server]: https://github.com/netless-io/flat-server
[flat-android]: https://github.com/netless-io/flat-android
[flat-storybook]: https://netless-io.github.io/flat/
[github-logo]: https://github.com/logos
