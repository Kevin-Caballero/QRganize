#!/usr/bin/env node

/**
 * Script to start the database and services
 * Usage: npm run start
 *        npm run start:dev (dev mode)
 */

const fs = require("fs");
const path = require("path");
const spawn = require("cross-spawn");
const prompts = require("prompts");
const { promisify } = require("util");
const existsAsync = promisify(fs.exists);
const which = require("which");

// Check if a command exists
const commandExists = (command) => {
  try {
    return which.sync(command, { nothrow: true }) !== null;
  } catch (error) {
    return false;
  }
};

// Parse command line arguments
const isDevMode = process.argv.includes("--dev");

async function startServices() {
  console.log(
    `🚀 Starting QRganize services in ${
      isDevMode ? "development" : "production"
    } mode...`
  );

  // Start the database first
  const dockerComposeExists = await existsAsync(
    path.join(__dirname, "..", "docker", "docker-compose.yaml")
  );
  if (!dockerComposeExists) {
    console.error(
      "❌ Docker compose configuration not found. Please check the docker directory."
    );
    process.exit(1);
  }

  // Prompt for startup method
  const { startupMethod } = await prompts({
    type: "select",
    name: "startupMethod",
    message: "How would you like to start the services?",
    choices: [
      { title: "Direct (separate terminals)", value: "direct" },
      { title: "Using PM2", value: "pm2" },
    ],
    initial: 0,
  });

  // Start DB using docker-compose
  console.log("⏳ Starting database...");
  const dockerDir = path.join(__dirname, "..", "docker");
  const dbStartResult = spawn.sync("docker-compose", ["up", "-d", "db"], {
    cwd: dockerDir,
    stdio: "inherit",
  });

  if (dbStartResult.status !== 0) {
    console.error("❌ Failed to start database");
    process.exit(1);
  }
  console.log("✅ Database is running");

  // Define services to start
  const services = [
    {
      name: "backend",
      dir: path.join(__dirname, "..", "services", "backend"),
      command: isDevMode ? "start:dev" : "start",
    },
    {
      name: "app",
      dir: path.join(__dirname, "..", "services", "app"),
      command: isDevMode ? "start:dev" : "start",
    },
  ];

  if (startupMethod === "direct") {
    // Start each service in a separate terminal
    for (const service of services) {
      console.log(`⏳ Starting ${service.name}...`);

      // Check if service directory exists
      if (!(await existsAsync(service.dir))) {
        console.error(
          `❌ Service directory for ${service.name} not found. Please run "npm run pull" first.`
        );
        continue;
      }

      // Start the service
      const startCommand = `cd "${service.dir}" && npm run ${service.command}`;

      // Use PowerShell to start a new window
      spawn.sync(
        "powershell.exe",
        [
          "-NoProfile",
          "-Command",
          `Start-Process powershell -ArgumentList '-NoExit', '-Command', '${startCommand}'`,
        ],
        {
          stdio: "inherit",
        }
      );

      console.log(`✅ ${service.name} is starting in a new terminal`);
    }
  } else if (startupMethod === "pm2") {
    // Check if PM2 is installed
    if (!commandExists("pm2")) {
      console.log("⏳ PM2 not found. Installing globally...");
      const npmInstallResult = spawn.sync("npm", ["install", "-g", "pm2"], {
        stdio: "inherit",
      });

      if (npmInstallResult.status !== 0) {
        console.error("❌ Failed to install PM2");
        process.exit(1);
      }
    }

    // Start services using PM2
    for (const service of services) {
      console.log(`⏳ Starting ${service.name} with PM2...`);

      // Check if service directory exists
      if (!(await existsAsync(service.dir))) {
        console.error(
          `❌ Service directory for ${service.name} not found. Please run "npm run pull" first.`
        );
        continue;
      }

      // Start the service with PM2
      const pm2StartResult = spawn.sync(
        "pm2",
        ["start", "npm", "--name", service.name, "--", "run", service.command],
        {
          cwd: service.dir,
          stdio: "inherit",
        }
      );

      if (pm2StartResult.status !== 0) {
        console.error(`❌ Failed to start ${service.name} with PM2`);
        process.exit(1);
      }

      console.log(`✅ ${service.name} is running with PM2`);
    }

    // Show PM2 status
    spawn.sync("pm2", ["status"], {
      stdio: "inherit",
    });

    console.log(
      '\nℹ️ Use "pm2 logs" to view logs or "pm2 stop all" to stop all services'
    );
  }

  console.log("🎉 All services are running!");
}

startServices().catch((err) => {
  console.error("Error starting services:", err);
  process.exit(1);
});
