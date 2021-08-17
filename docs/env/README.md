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

[open-wechat]: https://open.weixin.qq.com/
[netless-auth]: https://docs.agora.io/en/whiteboard/generate_whiteboard_token_at_app_server?platform=RESTful
[agora-app-id-auth]: https://docs.agora.io/en/Agora%20Platform/token#a-name--appidause-an-app-id-for-authentication
[cloud-recording]: https://docs.agora.io/en/cloud-recording/cloud_recording_api_rest?platform=RESTful#storageConfig
[cloud-recording-background]: https://docs.agora.io/en/cloud-recording/cloud_recording_layout?platform=RESTful#background
[electron-updater]: https://github.com/electron-userland/electron-builder/tree/master/packages/electron-updater
