# yarn-plugins

用于yarn berry中功能的增强

## prepare声明周期

在yarn 1.X版本中存在prepare的脚本周期，用于在依赖安装结束后做一些后续的处理，但在yarn升级后取消了

### 使用

在项目根目录中执行

`yarn plugin import https://raw.githubusercontent.com/heimeii/yarn-plugins/master/bundles/%40yarnpkg/plugin-prepare.js`

然后在package.json中

```json
"scripts": {
    "prepare": "echo 'prepare'",
},
```

## dedupe

其实在yarn berry中本身就存在一个yarn dedupe命令，但是这个dedupe在很多大型项目中并不符合我们的预期

yarn dedupe只有检测到不同版本且能被合并才会异常，例如3.2.3和^2.2.4在yarn dedupe不会检测出问题

这就会导致在项目中存在两个包进而引发环境异常，所以需要更加严格的dedupe，项目中对于某些特殊的包只能存在一个版本

因此参考基础的[yarn dedupe](https://github.com/yarnpkg/berry/blob/master/packages/plugin-essentials/sources/commands/dedupe.ts)逻辑，做了进一步的增强以满足和之前的yarn-dedupe功能相同

### 使用

`yarn plugin import https://raw.githubusercontent.com/heimeii/yarn-plugins/master/bundles/%40yarnpkg/plugin-dedupe.js`

`yarn strict-dedupe --check`

`yarn sd --check react '@babel/*'`
