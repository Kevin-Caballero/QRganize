/**
 * Script para iniciar solo la base de datos del proyecto
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Rutas
const backendDir = path.resolve(__dirname, "../services/backend");
const dockerDir = path.resolve(backendDir, "docker");

if (!fs.existsSync(dockerDir)) {
  console.error(`Error: El directorio ${dockerDir} no existe.`);
  process.exit(1);
}

// Función para ejecutar un comando
function executeCommand(command, args, cwd, onData, onError) {
  const childProcess = spawn(command, args, {
    cwd,
    shell: true,
    stdio: "pipe",
  });

  childProcess.stdout.on("data", (data) => {
    const output = data.toString();
    console.log(output);
    if (onData) onData(output);
  });

  childProcess.stderr.on("data", (data) => {
    const error = data.toString();
    console.error(error);
    if (onError) onError(error);
  });

  return new Promise((resolve, reject) => {
    childProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`El comando salió con código ${code}`));
      }
    });
  });
}

async function main() {
  console.log("Iniciando solo la base de datos...");

  try {
    // Navegar al directorio docker del backend y ejecutar docker-compose up
    await executeCommand("docker-compose", ["up", "-d"], dockerDir);
    console.log("Base de datos iniciada correctamente.");
    console.log("Para detener la base de datos, ejecute: npm run db:down");
  } catch (error) {
    console.error("Error al iniciar la base de datos:", error.message);
    process.exit(1);
  }
}

main();
