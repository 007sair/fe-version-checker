# fe-version-checker

[简体中文](./README.zh-CN.md) | English

A tool for detecting new deployments in frontend applications. When a new deployment is detected in the production environment, it prompts users to refresh the page.

## Features

- 🔄 Automatic version detection
- 🔒 Version information encrypted with Base64
- ⚡️ Supports ESM and UMD formats
- 📦 TypeScript type definitions included
- 🛠 Built-in CLI tool

## Installation

```bash
pnpm add fe-version-checker
```

## Usage

### 1. Generate Version File

During your project build process, use the built-in CLI tool to generate a version file:

```bash
npx generate-version -o ./public
# or after build
npx generate-version -o ./dist
```

This will generate a `version.json` file in the specified directory containing the current version information.

### 2. Usage in Frontend Project

```typescript
// Option 1: Default import
import VersionChecker from "fe-version-checker";

// Option 2: Named import (recommended)
import { VersionChecker } from "fe-version-checker";

// If you need type definitions
import type { VersionCheckerOptions, VersionInfo } from "fe-version-checker";

const checker = new VersionChecker({
  // All options are optional
  interval: 30000, // Check interval, default 60000ms (1 minute)
  versionUrl: "/version.json", // Version file path, default '/version.json'
  message: "New version available. Refresh the page?", // Custom prompt message
  silent: false, // Whether to output logs to console, default false
  // Custom handler for new version detection
  // If not configured, will trigger `window.confirm`
  onNewVersion: () => {
    console.log("New version detected");
  },
});

// Start checking
checker.start();

// Stop checking
// checker.stop();
```

### 3. Build Process Integration

Add build script to your `package.json`:

```json
{
  "scripts": {
    "build": "generate-version -o ./public && your-build-command"
  }
}
```

### 4. Using fe-version-checker with React

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
        key, // Set key to avoid duplicate messages
        duration: 0, // Set to 0 to prevent auto-close
        content: (
          <span>
            New version available.
            <a onClick={() => window.location.reload()}>Refresh</a>
            to get the latest updates
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
        // Use antd message component to show notification
        showAntdMessage();
      },
    });

    // Start checking
    checker.start();

    // Stop checking on component unmount
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

Key configuration notes:

- Use unique `key` to prevent duplicate messages
- `duration: 0` keeps the message visible until manually closed
- Use Button component as close button for better UX

## API

### VersionChecker Options

| Parameter    | Type       | Default                                 | Description                   |
| ------------ | ---------- | --------------------------------------- | ----------------------------- |
| interval     | number     | 60000                                   | Check interval (milliseconds) |
| versionUrl   | string     | '/version.json'                         | Version file path             |
| message      | string     | 'New version detected. Please refresh.' | Prompt message                |
| onNewVersion | () => void | Default confirmation dialog             | Callback for new version      |
| silent       | boolean    | false                                   | Disable console logs          |

### Methods

- `start()`: Start version checking
- `stop()`: Stop version checking

## CLI Tool

```bash
# Show help information
generate-version -h

# Generate version file in current directory
generate-version

# Generate version file in specified directory
generate-version -o ./public
generate-version --output ./dist

# Specify filename
generate-version -f custom.json      # Generates custom.json
generate-version -o ./public -f v1   # Generates v1.json in ./public
```

### CLI Options

| Option     | Short | Description      | Default      |
| ---------- | ----- | ---------------- | ------------ |
| --output   | -o    | Output directory | Current dir  |
| --filename | -f    | Output filename  | version.json |
| --help     | -h    | Show help info   | -            |

## How It Works

1. CLI tool generates a JSON file containing version information
2. Version info includes version number and timestamp, encrypted with Base64
3. Frontend periodically requests version file and compares with current version
4. Triggers callback function when version mismatch is detected

## Best Practices

1. Generate version file during production build
2. Host version file on CDN or static asset server
3. Adjust check interval based on requirements
4. Customize new version notification UI and interactions
5. Enable silent mode in production

## Advanced Usage

### 1. Micro-Frontend Scenarios

When using version checker in micro-frontend applications, absolute paths might cause resource request errors. Here's an example using micro-app:

```typescript
const prefix = window.__MICRO_APP_ENVIRONMENT__
  ? window.__MICRO_APP_PUBLIC_PATH__
  : "";

const checker = new VersionChecker({
  interval: 3000,
  silent: true,
  versionUrl: `${prefix}/version.json`,
  onNewVersion: () => {
    console.log("New version detected");
  },
});
```

> For `__MICRO_APP_PUBLIC_PATH__` configuration, refer to [micro-app documentation](https://jd-opensource.github.io/micro-app/docs.html#/zh-cn/env?id=__micro_app_public_path__)

### 2. Trigger Version Check on Specific Actions

#### 2.1 Start/Stop Checking Based on Page Visibility

```javascript
// Triggered by new page, tab switch/close, browser minimize/close
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    checker.stop();
  } else {
    checker.start();
  }
});
```

#### 2.2 Navigation Guard Integration

```javascript
const router = createRouter({ ... })

router.beforeEach((to, from) => {
  checker.start()
})
```

#### 2.3 Script Error Handling

Implementation varies based on specific requirements.

## License

MIT
