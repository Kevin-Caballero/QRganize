#!/usr/bin/env node

/**
 * Script to control Docker containers
 * Usage: npm run docker:status
 *        npm run docker:logs
 *        npm run docker:stop
 *        npm run docker:restart
 *        npm run docker:down
 *        npm run docker:clean
 */

const fs = require("fs");
const path = require("path");
const spawn = require("cross-spawn");
const { promisify } = require("util");
const existsAsync = promisify(fs.exists);

// Parse command line arguments
const command = process.argv[2] || "status";
const isDevMode =
  process.env.NODE_ENV === "development" || command.includes("dev");
const dockerDir = path.join(__dirname, "..", "docker");
const composeFile = isDevMode
  ? "docker-compose.dev.yaml"
  : "docker-compose.yaml";

async function controlDockerServices() {
  // Check if Docker Compose file exists
  if (!(await existsAsync(path.join(dockerDir, composeFile)))) {
    console.error(
      `❌ Docker Compose file ${composeFile} not found in ${dockerDir}`
    );
    process.exit(1);
  }

  switch (command) {
    case "status":
      console.log("⏳ Showing container status...");
      spawn.sync("docker-compose", ["-f", composeFile, "ps"], {
        cwd: dockerDir,
        stdio: "inherit",
      });
      break;

    case "logs":
      console.log("⏳ Showing container logs...");
      spawn.sync("docker-compose", ["-f", composeFile, "logs"], {
        cwd: dockerDir,
        stdio: "inherit",
      });
      break;

    case "stop":
      console.log("⏳ Stopping containers...");
      spawn.sync("docker-compose", ["-f", composeFile, "stop"], {
        cwd: dockerDir,
        stdio: "inherit",
      });
      console.log("✅ Containers stopped");
      break;

    case "restart":
      console.log("⏳ Restarting containers...");
      spawn.sync("docker-compose", ["-f", composeFile, "restart"], {
        cwd: dockerDir,
        stdio: "inherit",
      });
      console.log("✅ Containers restarted");
      break;

    case "down":
      console.log("⏳ Stopping and removing containers...");
      spawn.sync("docker-compose", ["-f", composeFile, "down"], {
        cwd: dockerDir,
        stdio: "inherit",
      });
      console.log("✅ Containers stopped and removed");
      break;

    case "clean":
      console.log("⏳ Cleaning up all containers and images...");

      // Stop and remove containers
      spawn.sync(
        "docker-compose",
        ["-f", composeFile, "down", "--rmi", "all", "--volumes"],
        {
          cwd: dockerDir,
          stdio: "inherit",
        }
      );

      // Remove orphaned images
      spawn.sync("docker", ["system", "prune", "-f"], {
        stdio: "inherit",
      });

      console.log("✅ All containers and images cleaned up");
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log(`
Available commands:
  status  - Show container status
  logs    - View container logs
  stop    - Stop containers
  restart - Restart containers
  down    - Stop and remove containers
  clean   - Remove all containers and images
      `);
      process.exit(1);
  }
}

controlDockerServices().catch((err) => {
  console.error(`Error controlling Docker services (${command}):`, err);
  process.exit(1);
});
