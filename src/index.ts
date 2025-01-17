import { VersionCheckerOptions, VersionInfo } from "./types";

export class VersionChecker {
  private options: Required<VersionCheckerOptions>;
  private currentVersion: VersionInfo | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(options: VersionCheckerOptions = {}) {
    this.options = {
      interval: 60000,
      versionUrl: "/version.json",
      message:
        "New version detected. Please refresh the page to get the latest updates.",
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
      this.error("Failed to fetch version info:", error);
      throw error;
    }
  }

  public async start(): Promise<void> {
    if (this.timer) {
      return;
    }

    try {
      // Get initial version info
      this.currentVersion = await this.getCurrentVersion();
      this.log("Version checking started");

      this.timer = setInterval(async () => {
        try {
          const newVersion = await this.getCurrentVersion();

          if (
            !this.currentVersion ||
            newVersion.version !== this.currentVersion.version ||
            newVersion.timestamp > this.currentVersion.timestamp
          ) {
            this.log("New version detected");
            this.options.onNewVersion();
            this.stop();
          }
        } catch (error) {
          this.error("Version check failed:", error);
        }
      }, this.options.interval);
    } catch (error) {
      this.error("Failed to start version checking:", error);
    }
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.log("Version checking stopped");
    }
  }
}

// Support both default and named exports
export { VersionCheckerOptions, VersionInfo } from "./types";
export default VersionChecker;
