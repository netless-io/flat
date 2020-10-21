

### Development

```shell
# renderer-app (The first shell window, Don't close)
cd packages/renderer-app
yarn start

# main-app (Second shell window, Don't close)
cd packages/main-app
yarn start
```

### Build

```shell
cd packages/renderer-app
yarn build
cd ../packages/main-app
# or yarn copy:renderBuildCode && yarn build:main && yarn pack:mac
yarn pack:mac:auto
```
