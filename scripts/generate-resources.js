/**
 * Script para generar recursos (iconos, splash) para la aplicación QRganize
 *
 * Este script es más simple que generate-apk.js y solo se encarga de generar
 * los recursos gráficos (iconos y splash) y sincronizarlos con el proyecto.
 */

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// Ruta al directorio de la aplicación
const appDir = path.join(__dirname, "..", "services", "app");

console.log("Generando recursos para la aplicación móvil...");

// Verificar que existe el directorio resources
if (!fs.existsSync(path.join(appDir, "resources"))) {
  fs.mkdirSync(path.join(appDir, "resources"), { recursive: true });
}

// Copiar el icono principal si no existe
if (!fs.existsSync(path.join(appDir, "resources", "icon.png"))) {
  fs.copyFileSync(
    path.join(appDir, "src", "assets", "qrganize_icon.png"),
    path.join(appDir, "resources", "icon.png")
  );
  console.log("Icon copiado a resources/icon.png");
}

// Crear un archivo de configuración para los recursos
const assetsConfigPath = path.join(appDir, "assets.config.json");
if (!fs.existsSync(assetsConfigPath)) {
  const assetsConfig = {
    ios: {
      icon: {
        source: "resources/icon.png",
        foreground: "resources/icon.png",
      },
      splash: {
        source: "resources/splash.png",
      },
    },
    android: {
      icon: {
        source: "resources/icon.png",
        foreground: "resources/icon.png",
        background: "#FFFFFF",
      },
      splash: {
        source: "resources/splash.png",
        background: "#FFFFFF",
      },
      adaptiveIcon: {
        foregroundImage: "resources/icon.png",
        backgroundColor: "#FFFFFF",
      },
    },
  };

  fs.writeFileSync(assetsConfigPath, JSON.stringify(assetsConfig, null, 2));
  console.log("Archivo de configuración de recursos creado");
}

// Crear un splash simple si no existe
if (!fs.existsSync(path.join(appDir, "resources", "splash.png"))) {
  // Si no tenemos splash, usamos el icono
  fs.copyFileSync(
    path.join(appDir, "resources", "icon.png"),
    path.join(appDir, "resources", "splash.png")
  );
  console.log("Splash creado a partir del icono");
}

// Cambiar al directorio de la aplicación
process.chdir(appDir);

// Ejecutar el comando de capacitor para generar los recursos
exec("npx @capacitor/assets", (error, stdout, stderr) => {
  if (error) {
    console.error(`Error ejecutando @capacitor/assets: ${error.message}`);
    return;
  }

  if (stderr) {
    console.error(`Error de @capacitor/assets: ${stderr}`);
    return;
  }

  console.log(`Recursos generados correctamente:\n${stdout}`);

  // Ejecutar el comando para sincronizar los cambios con el proyecto Android
  exec("npx cap sync android", (syncError, syncStdout, syncStderr) => {
    if (syncError) {
      console.error(`Error sincronizando con Android: ${syncError.message}`);
      return;
    }

    if (syncStderr) {
      console.error(`Error de sincronización: ${syncStderr}`);
      return;
    }

    console.log(`Sincronización con Android completada:\n${syncStdout}`);
    console.log("Ahora puedes compilar la APK con: npm run build:apk");
  });
});
