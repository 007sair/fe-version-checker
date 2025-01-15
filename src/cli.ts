#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import { VersionInfo } from "./types";

function encodeVersionInfo(info: VersionInfo): string {
  const jsonStr = JSON.stringify(info);
  return Buffer.from(jsonStr).toString("base64");
}

function parseArgs() {
  const args = process.argv.slice(2);
  let outputDir = process.cwd();
  let filename = "version.json";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--output" || args[i] === "-o") {
      outputDir = args[i + 1];
      i++; // 跳过下一个参数
      continue;
    }
    if (args[i] === "--filename" || args[i] === "-f") {
      filename = args[i + 1];
      if (!filename.endsWith(".json")) {
        filename += ".json";
      }
      i++; // 跳过下一个参数
      continue;
    }
  }

  return {
    outputDir: path.resolve(outputDir),
    filename,
  };
}

function generateVersionFile() {
  try {
    const { outputDir, filename } = parseArgs();

    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 读取当前目录下的 package.json
    const packagePath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));

    const versionInfo: VersionInfo = {
      version: packageJson.version,
      timestamp: Date.now(),
    };

    // 生成加密的版本信息
    const encodedInfo = encodeVersionInfo(versionInfo);

    // 生成 version.json 文件内容
    const fileContent = JSON.stringify({ data: encodedInfo }, null, 2);

    // 写入文件
    const outputPath = path.join(outputDir, filename);
    fs.writeFileSync(outputPath, fileContent);

    console.log("✅ 版本信息文件生成成功！");
    console.log("📂 输出目录:", outputDir);
    console.log("📄 文件路径:", outputPath);
    console.log("📦 版本号:", versionInfo.version);
    console.log("⏰ 时间戳:", new Date(versionInfo.timestamp).toLocaleString());
  } catch (error) {
    console.error("❌ 生成版本信息文件失败:", error);
    process.exit(1);
  }
}

// 显示帮助信息
function showHelp() {
  console.log(`
使用方法: generate-version [选项]

选项:
  -o, --output <dir>     指定输出目录（默认为当前目录）
  -f, --filename <name>  指定文件名（默认为 version.json）
  -h, --help             显示帮助信息

示例:
  generate-version                     # 在当前目录生成 version.json
  generate-version -o ./public         # 在 ./public 目录生成 version.json
  generate-version --output ./dist     # 在 ./dist 目录生成 version.json
  generate-version -f custom.json      # 生成 custom.json
  generate-version -o ./public -f v1   # 在 ./public 目录生成 v1.json
`);
}

// 处理命令行参数
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  showHelp();
} else {
  generateVersionFile();
}
