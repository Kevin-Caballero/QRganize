#!/usr/bin/env node

/**
 * Script to start services in Docker
 * Usage: npm run docker:start
 *        npm run docker:start:dev (dev mode with hot reload)
 */

const fs = require("fs");
const path = require("path");
const spawn = require("cross-spawn");
const { promisify } = require("util");
const existsAsync = promisify(fs.exists);

// Parse command line arguments
const isDevMode = process.argv.includes("--dev");

async function startDockerServices() {
  console.log(
    `🚀 Starting QRganize services in Docker (${
      isDevMode ? "development with hot reload" : "production"
    } mode)...`
  );

  const dockerDir = path.join(__dirname, "..", "docker");
  const composeFile = isDevMode
    ? "docker-compose.dev.yaml"
    : "docker-compose.yaml";

  // Check if Docker Compose file exists
  if (!(await existsAsync(path.join(dockerDir, composeFile)))) {
    console.error(
      `❌ Docker Compose file ${composeFile} not found in ${dockerDir}`
    );
    process.exit(1);
  }

  // Build services if needed
  console.log("⏳ Building Docker images...");
  const buildResult = spawn.sync(
    "docker-compose",
    ["-f", composeFile, "build"],
    {
      cwd: dockerDir,
      stdio: "inherit",
    }
  );

  if (buildResult.status !== 0) {
    console.error("❌ Failed to build Docker images");
    process.exit(1);
  }

  // Start services
  console.log("⏳ Starting Docker containers...");
  const startResult = spawn.sync(
    "docker-compose",
    ["-f", composeFile, "up", "-d"],
    {
      cwd: dockerDir,
      stdio: "inherit",
    }
  );

  if (startResult.status !== 0) {
    console.error("❌ Failed to start Docker containers");
    process.exit(1);
  }

  // Show running containers
  console.log("⏳ Showing running containers...");
  spawn.sync("docker-compose", ["-f", composeFile, "ps"], {
    cwd: dockerDir,
    stdio: "inherit",
  });

  console.log(`
🎉 All services are running in Docker!

ℹ️ Use the following commands to manage your Docker containers:
   - npm run docker:status  - Show container status
   - npm run docker:logs    - View container logs
   - npm run docker:stop    - Stop containers
   - npm run docker:restart - Restart containers
   - npm run docker:down    - Stop and remove containers
   - npm run docker:clean   - Remove all containers and images
  `);
}

startDockerServices().catch((err) => {
  console.error("Error starting Docker services:", err);
  process.exit(1);
});
