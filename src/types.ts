export interface VersionCheckerOptions {
  /**
   * Polling interval in milliseconds
   * 轮询间隔时间（毫秒）
   */
  interval?: number;

  /**
   * Version check URL, defaults to /version.json
   * 版本检查地址，默认为 /version.json
   */
  versionUrl?: string;

  /**
   * Custom message content
   * 自定义消息内容
   */
  message?: string;

  /**
   * Callback function when new version is detected
   * 检测到新版本后的回调函数
   */
  onNewVersion?: () => void;

  /**
   * Whether to suppress console output
   * 是否在控制台输出错误信息
   */
  silent?: boolean;
}

/**
 * Version information interface
 * 版本信息接口
 */
export interface VersionInfo {
  /**
   * Version string
   * 版本号
   */
  version: string;

  /**
   * Version timestamp
   * 时间戳
   */
  timestamp: number;
}
