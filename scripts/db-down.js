/**
 * Script para eliminar completamente la base de datos del proyecto (incluyendo volúmenes)
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
  console.log(
    "Eliminando completamente la base de datos (incluyendo volúmenes)..."
  );

  try {
    // Navegar al directorio docker del backend y ejecutar docker-compose down -v
    // El flag -v elimina los volúmenes asociados
    await executeCommand("docker-compose", ["down", "-v"], dockerDir);
    console.log(
      "Base de datos eliminada completamente (contenedores y datos eliminados)."
    );
  } catch (error) {
    console.error("Error al eliminar la base de datos:", error.message);
    process.exit(1);
  }
}

main();
