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

### pnpm link --global

node_modules下生成

```
pnpm link --global
```

在项目中

```
pnpm link react --global
```

# 第三课 reconciler调度器

### React Element

React Element如果作为核心模块操作
的数据结构，存在的问题：
•无法表达节点之间的关系
•字段有限.不好拓展（比如：无法
表达状态）
所以，需要一种新的数据结构.他的特
点：
•介于React Element-5頁实UI节点之
间
•能够表达节点之间的关系
•方便拓展（不仅作为数据存储单
元，也能作为工作单元）

这就是fibNode虚拟DOM在React
中的实现）

当前我们了解的节点类型:
• JSX
• React Element
• FiberNode
• DOM Element

### reconciler的工作方式

対于同一个节点，比较其与fiberNode生成子fiberNode.井很据比较的结果生成不
同标记（插入、删除.移动•・・・・・）对应不同宿主环境API的执行|。

比如，挂载<div></div>

```
// react Element <div></div>
jsx('div')
// 对应fiberNode
null
// 生成字fiberNode
// 对应标记
Placement

```

将<div></div>更新为<p></p>:

```
// React Element<p></p>
jsx(p)
// 对应fiberNode
fiberNode({type:'div'})
// 生成字fiberNode
// 对应标记
Deletion(删除div) Placement(添加p)
```

当所有的React Element 比较完成后，会生成一颗faberNode树，一共会存在两颗fiberNode树：

-   current:与视图中真实UI对应的fiberNode树
-   workinProgress:触发更新后，正在reconclier中计算的fiberNode树

双缓冲技术介绍

### JSX消费顺序

03.初探Reconciler 20分钟开始讲解原理

DFS深度遍历与BFS广度优先遍历的区别

以DFS(深度遍历)React Element,这意味着：

-   如果有子节点，遍历子节点
-   如果没有子节点，遍历兄弟节点

```
<Card>
  <h3>你好</h3>
  <p>Big-react</p>
</Card>
```

这是个递归的过程，存在递，归两个阶段：

-   递：对应beginWork
-   归：对应completeWork

# 第四课 如何触发更新

常见的触发更新的方式：

-   ReactDOM.createRoot().render (或老版的ReactDOM.render)
-   this.setState
-   useState的dispatch方法

我们希望实现一套统一的更新机制，他的特点是:

-   兼容上述更新方式
-   方便后续扩展(优先级机制...)

### 更新机制的组成部分

-   代表更新的数据结构 --Update
-   消费update的数据结构 -- UpDateQueue

接下来的工作包括:

-   实现mount时调用的API
-   将API接入上述更新机制中

需要考虑的事情：

-   更新可能发生于任意组件，而更新的流程是从根节点递归
-   需要一个统一的根节点保存通信信息
