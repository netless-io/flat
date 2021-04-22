<div align="center">
<img width="200" height="200" src="./assets/flat-logo.png">
<h1>Agora Flat</h1>
<p>Project flat is the Web(under development), Windows and macOS client of <a href="https://flat.whiteboard.agora.io/en/">Agora Flat</a> open source classroom.</p>
<p><a href="./README-zh.md">中文</a></p>
<img src="./assets/flat-showcase.png">
</div>

## Try it now

-   [Download artifact][flat-homepage]
-   [Flat Components Storybook][flat-storybook]

## Features

-   Optimized teaching experience
    -   [x] Big class
    -   [x] Small class
    -   [x] One on one
-   Real-time interaction
    -   [x] Multifunctional interactive whiteboard
    -   [x] Real-time video/audio chat(RTC)
    -   [x] Real-time messaging(RTM)
    -   [x] Participant hand raising
-   Login via
    -   [x] Wechat
    -   [ ] GitHub
    -   [ ] Google
-   Classroom management
    -   [x] Join, create and schedule classrooms
    -   [x] Support periodic rooms
    -   [x] View room history
-   Classroom recording and replaying
    -   [x] Whiteboard replaying
    -   [x] Cloud recording for video and audio
    -   [x] Messaging replaying
-   [x] Cloud Storage for multi-media courseware
-   [x] Device self-check
-   [x] Auto Updater

## Development

UI and business logic are separated in Flat. You can run flat with [full build](#full-build) or quickly develop UI via [Storybook](#storybook).

## Full Build

Note that full-built Flat requires [Agora Flat Server][flat-server] backend.

### Setup Environment

1. Create two files `config/.env.development.local` and `config/.env.production.local`.
1. Add environment variables following the `config/.env` format.

-   See [Environment Variables Reference](#%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F%E5%80%BC%E5%8F%82%E8%80%83) bellow.
-   See [Files under version control](https://github.com/kerimdzhanov/dotenv-flow#files-under-version-control) for more about _.env.\*_ naming.

### Installation

1. <kbd>Fork</kbd> this repo so that Github Actions can work properly.
2. Then `git clone` the forked repo to local.
3. At project root：
    ```shell
    yarn install --frozen-lockfile
    ```

### Development Mode

Run `yarn start` at project root.

### Package Executable

-   Run `yarn ship` at project root to package base on current system type.
-   Or run `yarn ship:mac` or `yarn ship:win` at project root to package for the specified system.

## Storybook

Many Flat components UI can be quickly viewed and developed via Storybook ([Online address][flat-storybook]).

-   Run `yarn --cwd packages/flat-components storybook` at project root to run Storybook locally.

## Environment Variables Reference

| Variable                             | Description                                              | Note                                                                                |
| ------------------------------------ | -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| NETLESS_APP_IDENTIFIER               | Whiteboard Access Key                                    | See [Projects and permissions][netless-auth]                                        |
| AGORA_APP_ID                         | Agora App ID                                             | For RTC and RTM. See [Use an App ID for authentication][agora-app-id-auth]          |
| CLOUD_STORAGE_OSS_ALIBABA_ACCESS_KEY | Agora Cloud Recording OSS                                | For storing RTC Cloud Recording media files. See [Cloud Recording][cloud-recording] |
| CLOUD_STORAGE_OSS_ALIBABA_BUCKET     | Agora Cloud Recording OSS                                | As above                                                                            |
| CLOUD_STORAGE_OSS_ALIBABA_REGION     | Agora Cloud Recording OSS                                | As above                                                                            |
| CLOUD_RECORDING_DEFAULT_AVATAR       | Agora Cloud Recording default user avatar URL            | See: [Set the background color or background image][cloud-recording-background]     |
| WECHAT_APP_ID                        | [Wechat Open Platform][open-wechat] App ID               |                                                                                     |
| FLAT_SERVER_DOMAIN                   | Flat Server deployed address                             | e.g. `flat-api.whiteboard.agora.io`                                                 |
| UPDATE_DOMAIN                        | Flat upgrade OSS address for storing artifacts           | e.g. `https://flat-storage.oss-cn-hangzhou.aliyuncs.com/versions`                   |
| SKIP_MAC_NOTARIZE                    | Whether to skip the mac notarization step                | value: `yes` or `no`                                                                |
| APPLE_API_ISSUER                     | Apple notarizing issuer. Skip notarizing if not provided | See: [electron-updater][electron-updater]                                           |
| APPLE_API_KEY                        | Apple notarizing key. Skip notarizing if not provided    | See: [electron-updater][electron-updater]                                           |
| WINDOWS_CODE_SIGNING_CA_PATH         | Windows Code Signing CA file path. Skip if not provided  | Relative to `desktop/main-app`                                                      |
| WINDOWS_CODE_SIGNING_CA_PASSWORD     | Windows Code Signing CA password. Skip if not provided   |                                                                                     |

[flat-homepage]: https://flat.whiteboard.agora.io/
[flat-server]: https://github.com/netless-io/flat-server
[flat-storybook]: https://netless-io.github.io/flat/storybook/
[open-wechat]: https://open.weixin.qq.com/
[netless-auth]: https://docs.agora.io/en/whiteboard/generate_whiteboard_token_at_app_server?platform=RESTful
[agora-app-id-auth]: https://docs.agora.io/en/Agora%20Platform/token#a-name--appidause-an-app-id-for-authentication
[cloud-recording]: https://docs.agora.io/en/cloud-recording/cloud_recording_api_rest?platform=RESTful#storageConfig
[cloud-recording-background]: https://docs.agora.io/en/cloud-recording/cloud_recording_layout?platform=RESTful#background
[electron-updater]: https://github.com/electron-userland/electron-builder/tree/master/packages/electron-updater
