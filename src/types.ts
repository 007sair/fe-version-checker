export interface VersionCheckerOptions {
  /** 轮询间隔时间（毫秒） */
  interval?: number;
  /** 版本检查地址，默认为 /version.json */
  versionUrl?: string;
  /** 自定义消息内容 */
  message?: string;
  /** 检测到新版本后的回调函数 */
  onNewVersion?: () => void;
  /** 是否在控制台输出错误信息 */
  silent?: boolean;
}

export interface VersionInfo {
  version: string;
  timestamp: number;
}
