#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Rutas
const backendDir = path.resolve(__dirname, "../services/backend");
const publicImagesDir = path.join(backendDir, "public", "images");

// Asegurar que existe el directorio de imágenes
if (!fs.existsSync(publicImagesDir)) {
  console.log("Creando directorio para imágenes...");
  fs.mkdirSync(publicImagesDir, { recursive: true });
}

// Compilar el backend
console.log("Compilando el backend...");
const buildProcess = spawn("npm", ["run", "build"], {
  cwd: backendDir,
  shell: true,
});

buildProcess.stdout.on("data", (data) => {
  console.log(`Build: ${data}`);
});

buildProcess.stderr.on("data", (data) => {
  console.error(`Build error: ${data}`);
});

buildProcess.on("close", (code) => {
  if (code !== 0) {
    console.error(`La compilación falló con código ${code}`);
    return;
  }

  console.log("Compilación exitosa, iniciando el backend...");

  // Iniciar el backend
  const startProcess = spawn("npm", ["run", "start:dev"], {
    cwd: backendDir,
    shell: true,
  });

  startProcess.stdout.on("data", (data) => {
    console.log(`Backend: ${data}`);
  });

  startProcess.stderr.on("data", (data) => {
    console.error(`Backend error: ${data}`);
  });

  startProcess.on("close", (code) => {
    console.log(`El backend se detuvo con código ${code}`);
  });
});

console.log("Iniciando el proceso de compilación e inicio del backend...");
