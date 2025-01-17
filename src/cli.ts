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
      i++; // Skip next argument
      continue;
    }
    if (args[i] === "--filename" || args[i] === "-f") {
      filename = args[i + 1];
      if (!filename.endsWith(".json")) {
        filename += ".json";
      }
      i++; // Skip next argument
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

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Read package.json from current directory
    const packagePath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));

    const versionInfo: VersionInfo = {
      version: packageJson.version,
      timestamp: Date.now(),
    };

    // Generate encrypted version info
    const encodedInfo = encodeVersionInfo(versionInfo);

    // Generate version.json file content
    const fileContent = JSON.stringify({ data: encodedInfo }, null, 2);

    // Write to file
    const outputPath = path.join(outputDir, filename);
    fs.writeFileSync(outputPath, fileContent);

    console.log("✅ Version file generated successfully!");
    console.log("📂 Output directory:", outputDir);
    console.log("📄 File path:", outputPath);
    console.log("📦 Version:", versionInfo.version);
    console.log(
      "⏰ Timestamp:",
      new Date(versionInfo.timestamp).toLocaleString()
    );
  } catch (error) {
    console.error("❌ Failed to generate version file:", error);
    process.exit(1);
  }
}

// Show help information
function showHelp() {
  console.log(`  
Usage: generate-version [options]  

Options:  
  -o, --output <dir>     Specify output directory (default: current directory)  
  -f, --filename <name>  Specify filename (default: version.json)  
  -h, --help            Show help information  

Examples:  
  generate-version                     # Generate version.json in current directory  
  generate-version -o ./public         # Generate version.json in ./public  
  generate-version --output ./dist     # Generate version.json in ./dist  
  generate-version -f custom.json      # Generate custom.json  
  generate-version -o ./public -f v1   # Generate v1.json in ./public  
`);
}

// Handle command line arguments
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  showHelp();
} else {
  generateVersionFile();
}
