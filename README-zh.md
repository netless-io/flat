<div align="center">
    <img width="200" height="200" style="display: block;" src="./assets/flat-logo.png">
</div>

<div align="center">
    <img alt="GitHub" src="https://img.shields.io/github/license/netless-io/flat?color=9cf&style=flat-square">
    <img alt="GitHub repo size" src="https://img.shields.io/github/repo-size/netless-io/flat?color=9cf&style=flat-square">
    <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/netless-io/flat?color=9cf&style=flat-square">
    <a target="_blank" href="https://github.com/netless-io/flat/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22">
        <img alt="GitHub issues by-label" src="https://img.shields.io/github/issues/netless-io/flat/good%20first%20issue?color=9cf&label=good%20first%20issue&style=flat-square">
    </a>
</div>

<div align="center">
    <h1>Agora Flat</h1>
    <p>项目 flat 是 <a href="https://flat.whiteboard.agora.io/">Agora Flat</a> 开源教室的 Web 端、Windows 客户端与 macOS 客户端。</p>
    <img src="./assets/flat-showcase.png">
</div>

## 产品体验

-   [快速体验 Flat Web][flat-web]
-   [APP 下载地址][flat-homepage]
-   [Flat 组件库 Storybook][flat-storybook]

## 特性

-   前后端完全开源
    -   [x] [Flat Web][flat-web]
    -   [x] Flat 桌面端（[Windows][flat-homepage] 与 [macOS][flat-homepage]）
    -   [x] [Flat Android][flat-android]
    -   [x] [Flat Server][flat-server] 服务器
-   多场景课堂
    -   [x] 大班课
    -   [x] 小班课
    -   [x] 一对一
-   实时交互
    -   [x] 多功能互动白板
    -   [x] 实时音视频（RTC）通讯
    -   [x] 即时消息（RTM）聊天
    -   [x] 举手上麦发言
-   帐户系统
    -   [x] 微信登陆
    -   [x] GitHub 登陆
    -   [ ] 谷歌登陆
-   房间管理
    -   [x] 加入、创建、预定房间
    -   [x] 支持周期性房间
    -   [x] 查看历史房间
-   课堂录制回放
    -   [x] 白板信令回放
    -   [x] 音视频云录制回放
    -   [x] 群聊信令回放
-   [x] 多媒体课件云盘
-   [x] 设备检测
-   [x] 自动检查更新

## 本地开发

在 Flat 中 UI 逻辑与业务逻辑分开开发。可通过 [开发模式](#开发模式) 跑起项目，也可以通过 [Storybook](#storybook) 快速查看与开发部分 UI。

### 安装

在项目根目录执行：

```shell
yarn run bootstrap
```

### 开发模式

在项目根目录执行：

```shell
yarn run start
```

### 打包可执行文件

-   项目根执行 `yarn ship` 将根据当前系统打包。
-   或者项目根执行 `yarn ship:mac` 或 `yarn ship:win` 可针对相应系统打包。

## Storybook

部分 Flat 组件 UI 可通过 Storybook 快速查看与开发（[线上地址][flat-storybook]）。

-   项目根执行 `yarn --cwd packages/flat-components storybook` 可在本地运行 Storybook。

## 环境变量值参考

| 变量名                               | 描述                                               | 备注                                                             |
| ------------------------------------ | -------------------------------------------------- | ---------------------------------------------------------------- |
| NETLESS_APP_IDENTIFIER               | 互动白板 Access Key                                | 见: [在 app 服务端生成 Token][netless-auth]                      |
| AGORA_APP_ID                         | Agora 声网 App ID                                  | 用于 RTC 与 RTM。见: [校验用户权限][agora-app-id-auth]           |
| CLOUD_STORAGE_OSS_ALIBABA_ACCESS_KEY | Agora 云端录制 OSS 配置                            | 用于云端录制存储用户音视频。见: [云存储设置][cloud-recording]    |
| CLOUD_STORAGE_OSS_ALIBABA_BUCKET     | Agora 云端录制 OSS 配置                            | 同上                                                             |
| CLOUD_STORAGE_OSS_ALIBABA_REGION     | Agora 云端录制 OSS 配置                            | 同上                                                             |
| CLOUD_RECORDING_DEFAULT_AVATAR       | Agora 云端录制用户默认背景图 URL                   | 见：[设置背景色或背景图][cloud-recording-background]             |
| WECHAT_APP_ID                        | [微信开放平台][open-wechat] App ID                 | 见 `网站应用` 里 `AppID`                                         |
| FLAT_SERVER_DOMAIN                   | Flat Server 部署的域名地址                         | 如: `flat-api.whiteboard.agora.io`                               |
| UPDATE_DOMAIN                        | Flat 升级的 OSS 域名地址，用于存放新版与历史安装包 | 如: `https://flat-storage.oss-cn-hangzhou.aliyuncs.com/versions` |
| SKIP_MAC_NOTARIZE                    | 是否跳过 Mac 公证步骤                              | 值: `yes` 或者 `no`                                              |
| APPLE_API_ISSUER                     | Apple 公证的 issuer，可选，留空时不做公证          | 详情见: [electron-updater][electron-updater]                     |
| APPLE_API_KEY                        | Apple 公证的 key，可选，留空时不做公证             | 详情见: [electron-updater][electron-updater]                     |
| WINDOWS_CODE_SIGNING_CA_PATH         | Windows 签名证书文件路径，可选，留空时不做签名     | 相对路径，相对于 `desktop/main-app` 目录                         |
| WINDOWS_CODE_SIGNING_CA_PASSWORD     | Windows 签名证书密码，可选，留空时不做签名         |                                                                  |

[flat-homepage]: https://flat.whiteboard.agora.io/#download
[flat-web]: https://flat-web.whiteboard.agora.io/
[flat-server]: https://github.com/netless-io/flat-server
[flat-android]: https://github.com/netless-io/flat-android
[flat-storybook]: https://netless-io.github.io/flat/storybook/
[open-wechat]: https://open.weixin.qq.com/
[netless-auth]: https://docs.agora.io/cn/whiteboard/generate_whiteboard_token_at_app_server?platform=RESTful
[agora-app-id-auth]: https://docs.agora.io/cn/Agora%20Platform/token#a-name--appidause-an-app-id-for-authentication
[cloud-recording]: https://docs.agora.io/cn/cloud-recording/cloud_recording_api_rest?platform=RESTful#storageConfig
[cloud-recording-background]: https://docs.agora.io/cn/cloud-recording/cloud_recording_layout?platform=RESTful#background
[electron-updater]: https://github.com/electron-userland/electron-builder/tree/master/packages/electron-updater
