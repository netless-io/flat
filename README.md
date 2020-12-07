### 开发

```shell
yarn

# renderer-app (第一个窗口，不要关闭)
cd src/renderer-app
yarn start

# main-app (第二个窗口，不要关闭)
cd src/main-app
yarn start
```

### 构建

```shell
cd src/renderer-app
yarn build
cd ../src/main-app
yarn pack:mac:auto
```
