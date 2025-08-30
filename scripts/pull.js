#!/usr/bin/env node

/**
 * Script to clone git submodules for services
 * Usage: npm run pull
 */

const fs = require("fs");
const path = require("path");
const spawn = require("cross-spawn");
const { promisify } = require("util");
const mkdirAsync = promisify(fs.mkdir);
const existsAsync = promisify(fs.exists);

// Read package.json to get services URLs
const packageJson = require("../package.json");
const servicesConfig = packageJson.services || {};

async function pullServices() {
  console.log("🚀 Pulling QRganize services...");

  // Create services directory if it doesn't exist
  const servicesDir = path.join(__dirname, "..", "services");
  if (!(await existsAsync(servicesDir))) {
    await mkdirAsync(servicesDir, { recursive: true });
    console.log("📁 Created services directory");
  }

  // Clone or pull each service
  for (const [serviceName, serviceUrl] of Object.entries(servicesConfig)) {
    const serviceDir = path.join(servicesDir, serviceName);

    if (await existsAsync(serviceDir)) {
      console.log(`⏳ Updating ${serviceName} from ${serviceUrl}...`);

      // Pull latest changes
      const pullResult = spawn.sync("git", ["pull"], {
        cwd: serviceDir,
        stdio: "inherit",
      });

      if (pullResult.status !== 0) {
        console.error(`❌ Failed to pull ${serviceName}`);
        process.exit(1);
      }
    } else {
      console.log(`⏳ Cloning ${serviceName} from ${serviceUrl}...`);

      // Parse the URL to extract branch if specified
      let [repoUrl, branch] = serviceUrl.split("#");
      branch = branch || "main";

      // Clone the repository
      const cloneResult = spawn.sync(
        "git",
        ["clone", "--branch", branch, repoUrl, serviceDir],
        {
          stdio: "inherit",
        }
      );

      if (cloneResult.status !== 0) {
        console.error(`❌ Failed to clone ${serviceName}`);
        process.exit(1);
      }
    }

    console.log(`✅ Service ${serviceName} is ready`);
  }

  console.log("🎉 All services pulled successfully!");
}

pullServices().catch((err) => {
  console.error("Error pulling services:", err);
  process.exit(1);
});
