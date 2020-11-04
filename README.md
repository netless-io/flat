

### 开发

```shell
# 构建依赖包
npx lerna run build --scope="*-pkg"

# renderer-app (第一个窗口，不要关闭)
cd src/renderer-app
yarn start

# main-app (第二个窗口，不要关闭)
cd src/main-app
yarn start

# 装第三方库时
npx lerna add package-name --scope="main-app" --dev
npx lerna add package-name --scope="*-app"

# 卸载第三方库时
# 在 package.json 中移除要卸载的第三方库
npx lerna bootstrap
```

### 构建

```shell
cd src/renderer-app
yarn build
cd ../src/main-app
yarn pack:mac:auto
```
