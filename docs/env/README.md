## Environment Variables Reference

| Variable                             | Description                                              | Note                                                                                |
| ------------------------------------ | -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| CLOUD_RECORDING_DEFAULT_AVATAR       | Agora Cloud Recording default user avatar URL            | See: [Set the background color or background image][cloud-recording-background]     |
| FLAT_SERVER_DOMAIN                   | Flat Server deployed address                             | e.g. `flat-api.whiteboard.agora.io`                                                 |
| UPDATE_DOMAIN                        | Flat upgrade OSS address for storing artifacts           | e.g. `https://flat-storage.oss-cn-hangzhou.aliyuncs.com/versions`                   |
| SKIP_MAC_NOTARIZE                    | Whether to skip the mac notarization step                | value: `yes` or `no`                                                                |
| APPLE_API_ISSUER                     | Apple notarizing issuer. Skip notarizing if not provided | See: [electron-updater][electron-updater]                                           |
| APPLE_API_KEY                        | Apple notarizing key. Skip notarizing if not provided    | See: [electron-updater][electron-updater]                                           |
| WINDOWS_CODE_SIGNING_CA_PATH         | Windows Code Signing CA file path. Skip if not provided  | Relative to `desktop/main-app`                                                      |
| WINDOWS_CODE_SIGNING_CA_PASSWORD     | Windows Code Signing CA password. Skip if not provided   |                                                                                     |

[cloud-recording]: https://docs.agora.io/en/cloud-recording/cloud_recording_api_rest?platform=RESTful#storageConfig
[cloud-recording-background]: https://docs.agora.io/en/cloud-recording/cloud_recording_layout?platform=RESTful#background
[electron-updater]: https://github.com/electron-userland/electron-builder/tree/master/packages/electron-updater
