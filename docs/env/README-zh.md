## 环境变量值参考

| 变量名                               | 描述                                               | 备注                                                             |
| ------------------------------------ | -------------------------------------------------- | ---------------------------------------------------------------- |
| CLOUD_RECORDING_DEFAULT_AVATAR       | Agora 云端录制用户默认背景图 URL                   | 见：[设置背景色或背景图][cloud-recording-background]             |
| FLAT_SERVER_DOMAIN                   | Flat Server 部署的域名地址                         | 如: `flat-api.whiteboard.agora.io`                               |
| UPDATE_DOMAIN                        | Flat 升级的 OSS 域名地址，用于存放新版与历史安装包 | 如: `https://flat-storage.oss-cn-hangzhou.aliyuncs.com/versions` |
| SKIP_MAC_NOTARIZE                    | 是否跳过 Mac 公证步骤                              | 值: `yes` 或者 `no`                                              |
| APPLE_API_ISSUER                     | Apple 公证的 issuer，可选，留空时不做公证          | 详情见: [electron-updater][electron-updater]                     |
| APPLE_API_KEY                        | Apple 公证的 key，可选，留空时不做公证             | 详情见: [electron-updater][electron-updater]                     |
| WINDOWS_CODE_SIGNING_CA_PATH         | Windows 签名证书文件路径，可选，留空时不做签名     | 相对路径，相对于 `desktop/main-app` 目录                         |
| WINDOWS_CODE_SIGNING_CA_PASSWORD     | Windows 签名证书密码，可选，留空时不做签名         |                                                                  |

[cloud-recording]: https://docs.agora.io/cn/cloud-recording/cloud_recording_api_rest?platform=RESTful#storageConfig
[cloud-recording-background]: https://docs.agora.io/cn/cloud-recording/cloud_recording_layout?platform=RESTful#background
[electron-updater]: https://github.com/electron-userland/electron-builder/tree/master/packages/electron-updater
