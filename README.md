

### 开发

```shell
# 构建依赖包
lerna run build --scope="*-pkg"

# renderer-app (第一个窗口，不要关闭)
cd packages/renderer-app
yarn start

# main-app (第二个窗口，不要关闭)
cd packages/main-app
yarn start

# 装第三方库时
lerna add package-name --scope="main-app" --dev
lerna add package-name --scope="*-app"

# 卸载第三方库时
# 在 package.json 中移除要卸载的第三方库
lerna bootstrap
```

### 构建

```shell
cd packages/renderer-app
yarn build
cd ../packages/main-app
yarn pack:mac:auto
```
