import { VersionCheckerOptions, VersionInfo } from "./types";

export class VersionChecker {
  private options: Required<VersionCheckerOptions>;
  private currentVersion: VersionInfo | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(options: VersionCheckerOptions = {}) {
    this.options = {
      interval: 60000,
      versionUrl: "/version.json",
      message: "检测到新版本已部署，请刷新页面获取最新内容。",
      onNewVersion: () => {
        if (window.confirm(this.options.message)) {
          window.location.reload();
        }
      },
      silent: false,
      ...options,
    };
  }

  private log(message: string) {
    if (!this.options.silent) {
      console.log(message);
    }
  }

  private error(message: string, error?: any) {
    if (!this.options.silent) {
      console.error(message, error);
    }
  }

  private async getCurrentVersion(): Promise<VersionInfo> {
    try {
      const response = await fetch(
        this.options.versionUrl + "?t=" + Date.now()
      );
      const json = await response.json();
      const decodedInfo = JSON.parse(atob(json.data));
      return decodedInfo;
    } catch (error) {
      this.error("获取版本信息失败:", error);
      throw error;
    }
  }

  public async start(): Promise<void> {
    if (this.timer) {
      return;
    }

    try {
      // 获取初始版本信息
      this.currentVersion = await this.getCurrentVersion();
      this.log("版本检测已启动");

      this.timer = setInterval(async () => {
        try {
          const newVersion = await this.getCurrentVersion();

          if (
            !this.currentVersion ||
            newVersion.version !== this.currentVersion.version ||
            newVersion.timestamp > this.currentVersion.timestamp
          ) {
            this.log("检测到新版本");
            this.options.onNewVersion();
            this.stop();
          }
        } catch (error) {
          this.error("版本检查失败:", error);
        }
      }, this.options.interval);
    } catch (error) {
      this.error("启动版本检测失败:", error);
    }
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.log("版本检测已停止");
    }
  }
}

// 同时支持默认导出和具名导出
export { VersionCheckerOptions, VersionInfo } from "./types";
export default VersionChecker;
