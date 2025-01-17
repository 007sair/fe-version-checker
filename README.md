# fe-version-checker

一个用于检测前端应用是否有新部署的工具。当检测到生产环境有新的部署时，会提示用户刷新页面。

## 特性

- 🔄 自动检测新版本
- 🔒 版本信息使用 Base64 加密
- ⚡️ 支持 ESM 和 UMD 格式
- 📦 提供 TypeScript 类型支持
- 🛠 内置命令行工具

## 安装

```bash
pnpm add fe-version-checker
```

## 使用方法

### 1. 生成版本文件

在你的项目构建过程中，使用内置的命令行工具生成版本文件：

```bash
npx generate-version -o ./public
# or 构建结束后
npx generate-version -o ./dist
```

这会在指定目录生成一个 `version.json` 文件，包含了当前版本信息。

### 2. 在前端项目中使用

```typescript
// 方式一：默认导入
import VersionChecker from "fe-version-checker";

// 方式二：具名导入（推荐）
import { VersionChecker } from "fe-version-checker";

// 如果需要类型定义
import type { VersionCheckerOptions, VersionInfo } from "fe-version-checker";

const checker = new VersionChecker({
  // 配置项都是可选的
  interval: 30000, // 检查间隔，默认 60000ms (1分钟)
  versionUrl: "/version.json", // 版本文件路径，默认 '/version.json'
  message: "发现新版本，是否刷新页面？", // 自定义提示信息
  silent: false, // 是否在控制台输出日志，默认 false
  // 自定义处理新版本的逻辑，不配置时会触发 `window.confirm` 函数
  onNewVersion: () => {
    console.log("检测到新版本");
  },
});

// 开始检测
checker.start();

// 停止检测
// checker.stop();
```

### 3. 在构建流程中集成

在你的 `package.json` 中添加构建脚本：

```json
{
  "scripts": {
    "build": "generate-version -o ./public && your-build-command"
  }
}
```

### 4. 在 React 中使用 fe-version-checker

```tsx
import VersionChecker from "fe-version-checker";

import { useEffect } from "react";
import { message, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";

const App = () => {
  useEffect(() => {
    const showAntdMessage = () => {
      const key = "version-update";
      message.info({
        key, // 设置key避免重复显示
        duration: 0, // 设置为0，消息不会自动关闭
        content: (
          <span>
            检测到新版本，请
            <a onClick={() => window.location.reload()}>刷新页面</a>
            获取最新内容
            <Button
              style={{ marginLeft: 10 }}
              size="small"
              type="text"
              icon={<CloseOutlined />}
              onClick={() => message.destroy(key)}
            />
          </span>
        ),
      });
    };

    const checker = new VersionChecker({
      interval: 30000,
      silent: true,
      onNewVersion: () => {
        // 使用 antd 的 message 组件显示提示
        showAntdMessage();
      },
    });

    // 开始检测
    checker.start();

    // 组件卸载时停止检测
    return () => {
      checker.stop();
    };
  }, []);

  return (
    <div>
      <h1>Your App Content</h1>
    </div>
  );
};

export default App;
```

关键配置说明：

- 使用唯一的 `key` 避免重复显示消息
- `duration: 0` 使消息保持显示直到手动关闭
- 使用 Button 组件作为关闭按钮，提供更好的交互体验

## API

### VersionChecker 配置项

| 参数         | 类型       | 默认值                                         | 说明                   |
| ------------ | ---------- | ---------------------------------------------- | ---------------------- |
| interval     | number     | 60000                                          | 检查间隔时间（毫秒）   |
| versionUrl   | string     | '/version.json'                                | 版本文件路径           |
| message      | string     | '检测到新版本已部署，请刷新页面获取最新内容。' | 提示信息               |
| onNewVersion | () => void | 默认弹出确认框                                 | 发现新版本时的回调函数 |
| silent       | boolean    | false                                          | 是否在控制台输出日志   |

### 方法

- `start()`: 开始检测版本
- `stop()`: 停止检测版本

## 命令行工具

```bash
# 显示帮助信息
generate-version -h

# 在当前目录生成版本文件
generate-version

# 在指定目录生成版本文件
generate-version -o ./public
generate-version --output ./dist

# 指定文件名
generate-version -f custom.json      # 生成 custom.json
generate-version -o ./public -f v1   # 在 ./public 目录生成 v1.json
```

### 命令行参数

| 参数       | 简写 | 说明           | 默认值       |
| ---------- | ---- | -------------- | ------------ |
| --output   | -o   | 指定输出目录   | 当前目录     |
| --filename | -f   | 指定输出文件名 | version.json |
| --help     | -h   | 显示帮助信息   | -            |

## 工作原理

1. 通过命令行工具生成包含版本信息的 JSON 文件
2. 版本信息包含版本号和时间戳，使用 Base64 加密
3. 前端定期请求版本文件并与当前版本比对
4. 当检测到版本不一致时触发回调函数

## 最佳实践

1. 在生产环境构建时生成版本文件
2. 将版本文件放在 CDN 或静态资源服务器上
3. 根据实际需求调整检测间隔时间
4. 可以自定义新版本提示的 UI 和交互
5. 在生产环境中建议开启 silent 模式

## 其他实践

### 1. 微前端场景

当版本检测的应用作为子应用被嵌入时，使用绝对路径会导致请求资源路径错误。以 micro-app 为例，需要做如下配置的修改：

```typescript
const prefix = window.__MICRO_APP_ENVIRONMENT__
  ? window.__MICRO_APP_PUBLIC_PATH__
  : "";

const checker = new VersionChecker({
  interval: 3000,
  silent: true,
  versionUrl: `${prefix}/version.json`,
  onNewVersion: () => {
    console.log("检测到新版本");
  },
});
```

> `__MICRO_APP_PUBLIC_PATH__` 配置请参考 [micro-app 官方文档](https://jd-opensource.github.io/micro-app/docs.html#/zh-cn/env?id=__micro_app_public_path__)

### 2. 用户触发某些特定动作时主动执行版本检查

#### 2.1 页面可见性状态变化时启动/关闭版本检测

```javascript
// 新页面、切换/关闭标签页、最小化/关闭浏览器都会触发该事件
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    checker.stop();
  } else {
    checker.start();
  }
});
```

#### 2.2 导航守卫中触发

```javascript
const router = createRouter({ ... })

router.beforeEach((to, from) => {
  checker.start()
})
```

#### 2.3 script 脚本报错时触发

这里不做赘述，具体情况因人而异。

## 许可证

MIT
