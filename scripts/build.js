#!/usr/bin/env node

/**
 * Script to build all services
 * Usage: npm run build
 */

const fs = require("fs");
const path = require("path");
const spawn = require("cross-spawn");
const { promisify } = require("util");
const existsAsync = promisify(fs.exists);

// Read package.json to get services
const packageJson = require("../package.json");
const servicesConfig = packageJson.services || {};

async function buildServices() {
  console.log("🚀 Building QRganize services...");

  const servicesDir = path.join(__dirname, "..", "services");
  if (!(await existsAsync(servicesDir))) {
    console.error(
      '❌ Services directory not found. Please run "npm run pull" first.'
    );
    process.exit(1);
  }

  // Get all service directories
  const serviceDirs = Object.keys(servicesConfig);

  for (const serviceName of serviceDirs) {
    const serviceDir = path.join(servicesDir, serviceName);

    if (!(await existsAsync(serviceDir))) {
      console.error(
        `❌ Service directory for ${serviceName} not found. Please run "npm run pull" first.`
      );
      continue;
    }

    // Build the service
    console.log(`⏳ Building ${serviceName}...`);
    const buildResult = spawn.sync("npm", ["run", "build"], {
      cwd: serviceDir,
      stdio: "inherit",
    });

    if (buildResult.status !== 0) {
      console.error(`❌ Failed to build ${serviceName}`);
      process.exit(1);
    }

    console.log(`✅ Service ${serviceName} built successfully`);
  }

  console.log("🎉 All services built successfully!");
}

buildServices().catch((err) => {
  console.error("Error building services:", err);
  process.exit(1);
});
