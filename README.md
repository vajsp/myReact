# myReact

nvm node_mirror https://registry.npmmirror.com/mirrors/node/
nvm npm_mirror https://registry.npmmirror.com/mirrors/npm/

node_mirror: https://npmmirror.com/mirrors/node/
npm_mirror: https://npmmirror.com/mirrors/npm/

<!-- 配置淘宝镜像源 -->

pnpm config set registry https://registry.npmmirror.com/

<!-- 还原镜像 -->

pnpm config delete registry

需要安装 npm install pnpm@7.18.2 -g，不加版本号会报错

pnpm init

# 1.搭架子

### 语法检查

```
pnpm i eslint -D -w
```

-w 代表根目录

初始化

```
npx eslint --init
```

```
pnpm i -D -w @typescript-eslint/eslint-plugin
```

### 风格检查

```
pnpm i prettier -D -w
```

新建.pretterrc.json配置文件

将prettier集成到eslint中，期中
eslint-config-prettier: 覆盖ESLint本身规则配置
eslint-plugin-prettier: 用Prettier来接管修复代码即eslint --fix

"lint": "eslint --ext .ts,.jsx,.tsx --fix --quiet ./packages"

设置中format

### commit规范检查

安装husky,用于拦截commit命令

```
pnpm i husky@8.0.1 -D -w
```

```
npx husky install
```

将刚才实现的格式化命令pnpm lint纳入commit时husky将执行的脚本

```
npx husky add .husky/pre-commit "pre-lint"
```

pnpm 会对代码全量检查，当项目复杂后执行速度，可能比较慢，届时可以考虑使用lint-staged，实现只对暂存区代码进行检查。
通过commitlint对git提交信息进行检查，首先安装必要的库
pnpm i commitlint@17.1.2 -D -w
pnpm i @commitlint/cli@17.1.2 -D -w
pnpm i @commitlint/config-conventional@17.1.0 -D -w

新建配置文件.commitlintrc.js

```
module.exports = {
    extends: ['@commitlint/config-conventional'],
};
```

集成到husky中：

```
npx husky add .husky/commit-msg "npx --no-intall commitlint -e $HUSKY_GIT_PARAMS"
```

conventional 规范集意义

```
feat 表示新增了一个功能

`fix 表示修复了一个 bug

docs 只涉及到文档的更改

style 不影响代码语义的变化（格式化等类型）

refactor 代码重构，既不修复错误也不添加功能

perf 改进性能的代码更改

test 添加确认测试或更正现有的测试

`build 影响构建系统或外部依赖关系的更改

ci 更改持续集成文件和脚本

chore 其他不修改src或test`文件

revert 回退 commit
```

### 打包工具

```
pnpm i -D -w rollup@3.1.0
```
