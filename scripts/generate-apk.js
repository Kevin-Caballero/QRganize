/**
 * Script para generar un APK para la aplicación QRganize
 *
 * Este script automatiza el proceso de construcción de la aplicación Angular,
 * preparación de recursos (iconos, splash), corrección de URLs de imagen,
 * la sincronización de Capacitor y la compilación de la APK de Android.
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

// Colores para los mensajes en la consola
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

// Función para ejecutar comandos y mostrar mensajes
function executeCommand(command, message) {
  console.log(`${colors.blue}⏳ ${message}...${colors.reset}`);
  try {
    execSync(command, { stdio: "inherit" });
    console.log(`${colors.green}✅ ${message} completado${colors.reset}`);
    return true;
  } catch (error) {
    console.error(
      `${colors.red}❌ Error durante ${message.toLowerCase()}${colors.reset}`
    );
    console.error(`${colors.red}${error.message}${colors.reset}`);
    return false;
  }
}

// Función para obtener la IP local
function getLocalIP() {
  try {
    const networkInterfaces = os.networkInterfaces();
    let localIp = "192.168.1.100"; // IP por defecto

    // Buscar una dirección IPv4 que no sea localhost
    Object.keys(networkInterfaces).forEach((interfaceName) => {
      networkInterfaces[interfaceName].forEach((iface) => {
        if (!iface.internal && iface.family === "IPv4") {
          if (
            iface.address.startsWith("192.168.") ||
            iface.address.startsWith("10.") ||
            iface.address.startsWith("172.")
          ) {
            localIp = iface.address;
          }
        }
      });
    });

    console.log(
      `${colors.cyan}📡 IP local detectada: ${localIp}${colors.reset}`
    );
    return localIp;
  } catch (error) {
    console.log(
      `${colors.yellow}⚠️ No se pudo detectar la IP automáticamente. Usando IP por defecto: 192.168.1.100${colors.reset}`
    );
    return "192.168.1.100";
  }
}

// Función para preparar los recursos gráficos
function prepareResources(projectRoot) {
  console.log(
    `${colors.magenta}🎨 Preparando iconos y splash screens...${colors.reset}`
  );

  // Crear directorio de recursos si no existe
  const resourcesDir = path.join(projectRoot, "resources");
  if (!fs.existsSync(resourcesDir)) {
    fs.mkdirSync(resourcesDir, { recursive: true });
  }

  // Crear directorios para recursos de Android
  const androidDir = path.join(resourcesDir, "android");
  const androidIconDir = path.join(androidDir, "icon");
  const androidSplashDir = path.join(androidDir, "splash");

  if (!fs.existsSync(androidDir)) {
    fs.mkdirSync(androidDir, { recursive: true });
  }

  if (!fs.existsSync(androidIconDir)) {
    fs.mkdirSync(androidIconDir, { recursive: true });
  }

  if (!fs.existsSync(androidSplashDir)) {
    fs.mkdirSync(androidSplashDir, { recursive: true });
  }

  // Verificar si ya existe el icono que queremos mantener
  const iconDest = path.join(resourcesDir, "icon.png");
  let customIconExists = fs.existsSync(iconDest);

  if (customIconExists) {
    console.log(
      `${colors.green}✅ Usando el icono personalizado existente${colors.reset}`
    );
  } else {
    // Si no existe el icono personalizado, buscar en otras ubicaciones
    const possibleIconLocations = [
      path.join(projectRoot, "src", "assets", "qrganize_icon.png"),
      path.join(projectRoot, "src", "assets", "icon", "qrganize_icon.png"),
      path.join(projectRoot, "src", "assets", "Q.png"),
      path.join(projectRoot, "src", "assets", "logo-qrganize.svg"),
      path.join(projectRoot, "resources", "qrganize_icon.png"),
    ];

    let iconFound = false;

    for (const location of possibleIconLocations) {
      if (fs.existsSync(location)) {
        fs.copyFileSync(location, iconDest);
        console.log(
          `${colors.green}✅ Icono copiado desde ${location}${colors.reset}`
        );
        iconFound = true;
        customIconExists = true;
        break;
      }
    }

    if (!iconFound) {
      console.log(
        `${colors.yellow}⚠️ No se encontró un icono, la aplicación usará el icono por defecto${colors.reset}`
      );
    }
  }

  // Usar el mismo archivo del icono como splash screen
  if (customIconExists) {
    const splashDest = path.join(resourcesDir, "splash.png");

    // Verificar si ya existe un splash personalizado que queremos conservar
    if (fs.existsSync(splashDest)) {
      console.log(
        `${colors.green}✅ Usando el splash screen personalizado existente${colors.reset}`
      );
    } else {
      // Si no existe, copiar el archivo del icono como splash screen
      fs.copyFileSync(iconDest, splashDest);
      console.log(
        `${colors.green}✅ Splash screen creado usando el mismo archivo del icono${colors.reset}`
      );
    }

    // Crear recursos de Android directamente con redimensionamiento
    console.log(
      `${colors.blue}⏳ Creando recursos para Android con redimensionamiento...${colors.reset}`
    );

    // Definimos tamaños de iconos para Android
    const iconSizes = {
      "drawable-ldpi-icon.png": { width: 36, height: 36 },
      "drawable-mdpi-icon.png": { width: 48, height: 48 },
      "drawable-hdpi-icon.png": { width: 72, height: 72 },
      "drawable-xhdpi-icon.png": { width: 96, height: 96 },
      "drawable-xxhdpi-icon.png": { width: 144, height: 144 },
      "drawable-xxxhdpi-icon.png": { width: 192, height: 192 },
    };

    // Definimos tamaños de splash screens para Android
    const splashSizes = {
      "drawable-land-hdpi-screen.png": { width: 800, height: 480 },
      "drawable-land-ldpi-screen.png": { width: 320, height: 200 },
      "drawable-land-mdpi-screen.png": { width: 480, height: 320 },
      "drawable-land-xhdpi-screen.png": { width: 1280, height: 720 },
      "drawable-land-xxhdpi-screen.png": { width: 1600, height: 960 },
      "drawable-land-xxxhdpi-screen.png": { width: 1920, height: 1280 },
      "drawable-port-hdpi-screen.png": { width: 480, height: 800 },
      "drawable-port-ldpi-screen.png": { width: 200, height: 320 },
      "drawable-port-mdpi-screen.png": { width: 320, height: 480 },
      "drawable-port-xhdpi-screen.png": { width: 720, height: 1280 },
      "drawable-port-xxhdpi-screen.png": { width: 960, height: 1600 },
      "drawable-port-xxxhdpi-screen.png": { width: 1280, height: 1920 },
    };

    // Función para redimensionar imagen usando Sharp
    function resizeImage(source, destination, width, height) {
      try {
        // Usamos la sintaxis correcta de Sharp CLI
        const sharpCommand = `npx sharp -i "${source}" -o "${destination}" resize ${width} ${height}`;
        execSync(sharpCommand, { stdio: "ignore" });
        return true;
      } catch (error) {
        // Si hay error con Sharp, simplemente copiar la imagen
        fs.copyFileSync(source, destination);
        return false;
      }
    }

    // Crear iconos para Android con los tamaños correctos
    for (const [fileName, size] of Object.entries(iconSizes)) {
      const destIcon = path.join(androidIconDir, fileName);
      const resized = resizeImage(iconDest, destIcon, size.width, size.height);
      if (resized) {
        console.log(
          `${colors.green}✅ Icono ${fileName} redimensionado a ${size.width}x${size.height}${colors.reset}`
        );
      } else {
        console.log(
          `${colors.yellow}⚠️ No se pudo redimensionar icono ${fileName}, usando original${colors.reset}`
        );
      }
    }

    // Crear splash screens para Android con los tamaños correctos
    for (const [fileName, size] of Object.entries(splashSizes)) {
      const destSplash = path.join(androidSplashDir, fileName);
      const resized = resizeImage(
        splashDest,
        destSplash,
        size.width,
        size.height
      );
      if (resized) {
        console.log(
          `${colors.green}✅ Splash ${fileName} redimensionado a ${size.width}x${size.height}${colors.reset}`
        );
      } else {
        console.log(
          `${colors.yellow}⚠️ No se pudo redimensionar splash ${fileName}, usando original${colors.reset}`
        );
      }
    }

    console.log(
      `${colors.green}✅ Recursos para Android creados correctamente${colors.reset}`
    );
  }

  // Crear archivo de configuración para los recursos
  // Detectar el color de fondo del icono para usar como background
  // Usar el icono con fondo de color directamente sin aplicar padding
  const assetsConfig = {
    ios: {
      icon: { source: "resources/icon.png" },
      splash: { source: "resources/splash.png" },
    },
    android: {
      icon: {
        source: "resources/icon.png",
        foreground: "resources/icon.png",
        background: "transparent", // Usar transparente para que se vea el fondo del icono
      },
      splash: {
        source: "resources/splash.png",
        background: "transparent", // Usar transparente para que se vea el fondo del splash
      },
      adaptiveIcon: {
        foregroundImage: "resources/icon.png",
        backgroundColor: "transparent", // Usar transparente para que se vea el fondo del icono
      },
    },
  };

  fs.writeFileSync(
    path.join(projectRoot, "assets.config.json"),
    JSON.stringify(assetsConfig, null, 2)
  );
  console.log(
    `${colors.green}✅ Archivo de configuración de recursos creado${colors.reset}`
  );

  // Actualizar capacitor.config.ts para usar el nombre correcto de la app y configurar los iconos
  const capConfigPath = path.join(projectRoot, "capacitor.config.ts");
  if (fs.existsSync(capConfigPath)) {
    let capConfig = fs.readFileSync(capConfigPath, "utf8");

    // Actualizar el nombre de la app
    if (capConfig.includes("appName:")) {
      capConfig = capConfig.replace(/appName:.*?,/g, 'appName: "QRganize",');
      console.log(
        `${colors.green}✅ Nombre de la aplicación configurado${colors.reset}`
      );
    }

    // Asegurar que el config tenga las configuraciones necesarias para los iconos
    if (
      !capConfig.includes("iconPath:") &&
      !capConfig.includes("splashPath:")
    ) {
      // Buscar donde está el objeto android
      const androidRegex = /android:\s*{([^}]*)}/;
      const androidMatch = capConfig.match(androidRegex);

      if (androidMatch) {
        // Reemplazar la sección android con una que incluya configuración de iconos
        const updatedAndroidConfig = `android: {
    backgroundColor: '#ffffff',
    iconPath: 'resources/android/icon/drawable-xxxhdpi-icon.png',
    splashPath: 'resources/android/splash/drawable-port-xxxhdpi-screen.png'
  }`;

        capConfig = capConfig.replace(androidRegex, updatedAndroidConfig);
        console.log(
          `${colors.green}✅ Configuración de iconos para Android añadida${colors.reset}`
        );
      } else {
        // Si no existe la sección android, añadir antes del cierre del objeto config
        const configEndRegex = /};[\s\n]*export default config;/;
        if (configEndRegex.test(capConfig)) {
          const androidConfig = `  android: {
    backgroundColor: '#ffffff',
    iconPath: 'resources/android/icon/drawable-xxxhdpi-icon.png',
    splashPath: 'resources/android/splash/drawable-port-xxxhdpi-screen.png'
  },
};

export default config;`;

          capConfig = capConfig.replace(configEndRegex, androidConfig);
          console.log(
            `${colors.green}✅ Sección Android con configuración de iconos añadida${colors.reset}`
          );
        }
      }
    }

    fs.writeFileSync(capConfigPath, capConfig);
  }
}

// Función para actualizar la configuración del entorno móvil
function updateMobileEnvironment(projectRoot, localIp) {
  console.log(
    `${colors.magenta}🔄 Actualizando configuración para móvil...${colors.reset}`
  );

  const envMobilePath = path.join(
    projectRoot,
    "src",
    "environments",
    "environment.mobile.ts"
  );

  if (fs.existsSync(envMobilePath)) {
    let envContent = fs.readFileSync(envMobilePath, "utf8");

    // Actualizar la URL del API
    if (envContent.includes("apiUrl:")) {
      envContent = envContent.replace(
        /apiUrl:.*?,/g,
        `apiUrl: 'http://${localIp}:3000',`
      );
      fs.writeFileSync(envMobilePath, envContent);
      console.log(
        `${colors.green}✅ URL de API actualizada a http://${localIp}:3000${colors.reset}`
      );
    }
  }

  // Asegurarse de que existe el servicio de imágenes
  const imageServicePath = path.join(
    projectRoot,
    "src",
    "app",
    "shared",
    "services",
    "image-url.service.ts"
  );
  if (!fs.existsSync(imageServicePath)) {
    const imageServiceContent = `import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ImageUrlService {
  constructor() {}

  /**
   * Obtiene la URL absoluta para una imagen del servidor
   * @param imagePath Ruta de la imagen (puede ser nombre de archivo o ruta relativa)
   * @returns URL absoluta al recurso
   */
  getAbsoluteUrl(imagePath: string): string {
    if (!imagePath) return '';

    // Si ya es una URL absoluta, devolverla tal cual
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // Extraer el nombre del archivo si es una ruta
    const filename = imagePath.includes('/')
      ? imagePath.split('/').pop() || imagePath
      : imagePath;

    return \`\${environment.apiUrl}/public/images/\${filename}\`;
  }

  /**
   * Obtiene la URL base del API según el entorno
   */
  getApiBaseUrl(): string {
    return environment.apiUrl;
  }
}`;

    const servicesDir = path.dirname(imageServicePath);
    if (!fs.existsSync(servicesDir)) {
      fs.mkdirSync(servicesDir, { recursive: true });
    }

    fs.writeFileSync(imageServicePath, imageServiceContent);
    console.log(
      `${colors.green}✅ Servicio de URL de imágenes creado${colors.reset}`
    );
  }
}

// Función principal
async function generateApk() {
  try {
    console.log(
      `${colors.yellow}🚀 Iniciando generación de APK para QRganize${colors.reset}`
    );

    // Establecer directorio de trabajo en la raíz del proyecto (ahora apuntando a services/app)
    const appRoot = path.resolve(__dirname, "..", "services", "app");
    process.chdir(appRoot);

    console.log(
      `${colors.blue}📂 Directorio de trabajo: ${appRoot}${colors.reset}`
    );

    // Obtener la IP local para configurar el entorno móvil
    const localIp = getLocalIP();

    // Preparar recursos (iconos, splash, etc)
    prepareResources(appRoot);

    // Actualizar configuración para móvil
    updateMobileEnvironment(appRoot, localIp);

    // Paso 1: Generar assets para aplicación
    console.log(
      `${colors.blue}⏳ Generando assets para la aplicación con @capacitor/assets...${colors.reset}`
    );
    try {
      execSync("npx @capacitor/assets", { stdio: "inherit" });
      console.log(
        `${colors.green}✅ Generación de assets con @capacitor/assets completada${colors.reset}`
      );
    } catch (assetsError) {
      console.log(
        `${colors.yellow}⚠️ Error durante la generación de assets: ${assetsError.message}${colors.reset}`
      );
      console.log(
        `${colors.yellow}⚠️ Continuando a pesar del error...${colors.reset}`
      );
    }

    // Paso 2: No necesitamos ejecutar cordova-res, ya hemos generado todos los recursos manualmente
    console.log(
      `${colors.blue}⏳ Verificando recursos generados...${colors.reset}`
    );

    // Copiar los recursos generados a la estructura de Android
    try {
      // Verificar que los directorios de recursos existan
      const androidResDir = path.join(
        appRoot,
        "android",
        "app",
        "src",
        "main",
        "res"
      );

      // Verificar que existan los recursos en /resources/android
      const iconDir = path.join(appRoot, "resources", "android", "icon");
      const splashDir = path.join(appRoot, "resources", "android", "splash");

      if (fs.existsSync(iconDir) && fs.existsSync(splashDir)) {
        console.log(
          `${colors.green}✅ Recursos para Android encontrados${colors.reset}`
        );
      } else {
        console.log(
          `${colors.yellow}⚠️ No se encontraron todos los recursos. Los generaremos...${colors.reset}`
        );

        // Crear los directorios si no existen
        if (!fs.existsSync(iconDir)) {
          fs.mkdirSync(iconDir, { recursive: true });
        }

        if (!fs.existsSync(splashDir)) {
          fs.mkdirSync(splashDir, { recursive: true });
        }
      }

      // Copiar iconos y splash a la estructura de Android
      const iconSource = path.join(appRoot, "resources", "icon.png");
      const splashSource = path.join(appRoot, "resources", "splash.png");

      if (fs.existsSync(iconSource) && fs.existsSync(splashSource)) {
        console.log(
          `${colors.blue}⏳ Copiando recursos a la estructura de Android...${colors.reset}`
        );

        // Crear directorios para splash screens
        const splashDirs = [
          "drawable-land-hdpi",
          "drawable-land-ldpi",
          "drawable-land-mdpi",
          "drawable-land-xhdpi",
          "drawable-land-xxhdpi",
          "drawable-land-xxxhdpi",
          "drawable-port-hdpi",
          "drawable-port-ldpi",
          "drawable-port-mdpi",
          "drawable-port-xhdpi",
          "drawable-port-xxhdpi",
          "drawable-port-xxxhdpi",
        ];

        // Crear directorios para iconos
        const iconDirs = [
          "mipmap-mdpi",
          "mipmap-hdpi",
          "mipmap-xhdpi",
          "mipmap-xxhdpi",
          "mipmap-xxxhdpi",
        ];

        // Procesar directorios de splash
        for (const dir of splashDirs) {
          const destDir = path.join(androidResDir, dir);
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }

          const destFile = path.join(destDir, "screen.png");
          fs.copyFileSync(splashSource, destFile);
          console.log(
            `${colors.green}✅ Splash screen copiado a ${dir}${colors.reset}`
          );
        }

        // Procesar directorios de iconos
        for (const dir of iconDirs) {
          const destDir = path.join(androidResDir, dir);
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }

          // Copiar el icono para los diferentes tipos de iconos
          fs.copyFileSync(iconSource, path.join(destDir, "ic_launcher.png"));
          fs.copyFileSync(
            iconSource,
            path.join(destDir, "ic_launcher_round.png")
          );
          fs.copyFileSync(
            iconSource,
            path.join(destDir, "ic_launcher_foreground.png")
          );
          console.log(
            `${colors.green}✅ Iconos copiados a ${dir}${colors.reset}`
          );
        }

        // Crear XML para iconos adaptativos
        const anydpiDir = path.join(androidResDir, "mipmap-anydpi-v26");
        if (!fs.existsSync(anydpiDir)) {
          fs.mkdirSync(anydpiDir, { recursive: true });
        }

        const valuesDir = path.join(androidResDir, "values");
        if (!fs.existsSync(valuesDir)) {
          fs.mkdirSync(valuesDir, { recursive: true });
        }

        // Escribir archivo de colores
        const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">@android:color/transparent</color>
</resources>`;

        fs.writeFileSync(
          path.join(valuesDir, "ic_launcher_background.xml"),
          colorsXml
        );

        // Escribir XMLs para iconos adaptativos
        const launcherXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;

        fs.writeFileSync(path.join(anydpiDir, "ic_launcher.xml"), launcherXml);
        fs.writeFileSync(
          path.join(anydpiDir, "ic_launcher_round.xml"),
          launcherXml
        );

        console.log(
          `${colors.green}✅ Iconos adaptativos configurados correctamente${colors.reset}`
        );
      }
    } catch (error) {
      console.log(
        `${colors.yellow}⚠️ Error al copiar recursos: ${error.message}${colors.reset}`
      );
      console.log(
        `${colors.yellow}⚠️ Continuando con la construcción...${colors.reset}`
      );
    }

    // Los iconos adaptativos ya fueron configurados en el paso anterior, vamos directamente a actualizar el AndroidManifest.xml
    console.log(
      `${colors.blue}⏳ Actualizando configuración de iconos en AndroidManifest.xml...${colors.reset}`
    );

    try {
      const manifestFile = path.join(
        appRoot,
        "android",
        "app",
        "src",
        "main",
        "AndroidManifest.xml"
      );

      if (fs.existsSync(manifestFile)) {
        try {
          let manifestContent = fs.readFileSync(manifestFile, "utf8");

          // Solo modificar si no está ya configurado con nuestros iconos
          if (
            !manifestContent.includes(
              'android:roundIcon="@mipmap/ic_launcher_round"'
            )
          ) {
            // Buscar la línea que define el ícono
            const iconRegex = /android:icon="[^"]*"/;

            if (iconRegex.test(manifestContent)) {
              manifestContent = manifestContent.replace(
                iconRegex,
                'android:icon="@mipmap/ic_launcher" android:roundIcon="@mipmap/ic_launcher_round"'
              );

              fs.writeFileSync(manifestFile, manifestContent);
              console.log(
                `${colors.green}✅ AndroidManifest.xml actualizado con íconos adaptativos${colors.reset}`
              );
            }
          }
        } catch (manifestError) {
          console.log(
            `${colors.yellow}⚠️ No se pudo actualizar AndroidManifest.xml: ${manifestError.message}${colors.reset}`
          );
        }
      }
    } catch (iconError) {
      console.log(
        `${colors.yellow}⚠️ Error al actualizar configuración de iconos: ${iconError.message}${colors.reset}`
      );
    }

    // Paso 3: Asegurar que los recursos de Android se han generado correctamente
    console.log(
      `${colors.blue}⏳ Verificando recursos generados...${colors.reset}`
    );
    const androidResourcesDir = path.join(appRoot, "resources", "android");
    if (fs.existsSync(androidResourcesDir)) {
      console.log(
        `${colors.green}✅ Recursos para Android encontrados en ${androidResourcesDir}${colors.reset}`
      );
    } else {
      console.log(
        `${colors.red}❌ No se encontraron recursos para Android en ${androidResourcesDir}${colors.reset}`
      );
      console.log(
        `${colors.yellow}⚠️ La aplicación podría usar iconos por defecto${colors.reset}`
      );
    }

    // Paso 4: Construir la aplicación Angular
    console.log(
      `${colors.blue}⏳ Construyendo la aplicación Angular...${colors.reset}`
    );
    try {
      execSync("ng build", { stdio: "inherit" });
      console.log(
        `${colors.green}✅ Construcción de la aplicación Angular completada${colors.reset}`
      );
    } catch (buildError) {
      console.log(
        `${colors.red}❌ Error durante la construcción de la aplicación Angular: ${buildError.message}${colors.reset}`
      );
      return process.exit(1);
    }

    // Paso 5: Sincronizar con Capacitor
    console.log(
      `${colors.blue}⏳ Sincronizando con Capacitor...${colors.reset}`
    );
    try {
      execSync("npx cap sync", { stdio: "inherit" });
      console.log(
        `${colors.green}✅ Sincronización con Capacitor completada${colors.reset}`
      );
    } catch (syncError) {
      console.log(
        `${colors.red}❌ Error durante la sincronización con Capacitor: ${syncError.message}${colors.reset}`
      );
      return process.exit(1);
    }

    // Paso 6: Compilar APK
    console.log(`${colors.blue}⏳ Compilando APK...${colors.reset}`);
    try {
      // Cambiar al directorio de Android
      const androidDir = path.join(appRoot, "android");
      console.log(
        `${colors.blue}📂 Cambiando al directorio de Android: ${androidDir}${colors.reset}`
      );
      process.chdir(androidDir);

      // Comando para Windows o Unix
      const gradleCommand =
        os.platform() === "win32"
          ? "gradlew.bat assembleDebug"
          : "./gradlew assembleDebug";

      console.log(
        `${colors.blue}⚙️ Ejecutando comando: ${gradleCommand}${colors.reset}`
      );
      execSync(gradleCommand, { stdio: "inherit" });

      console.log(
        `${colors.green}✅ Compilación de APK completada${colors.reset}`
      );

      // Volver al directorio raíz
      process.chdir(appRoot);

      // Verificar si el APK fue generado
      const apkPath = path.join(
        appRoot,
        "android",
        "app",
        "build",
        "outputs",
        "apk",
        "debug",
        "app-debug.apk"
      );

      console.log(
        `${colors.blue}🔍 Verificando si el APK fue generado en: ${apkPath}${colors.reset}`
      );

      if (fs.existsSync(apkPath)) {
        console.log(
          `${colors.green}🎉 APK generada exitosamente${colors.reset}`
        );
        console.log(
          `${colors.yellow}📱 Puedes encontrar tu APK en:${colors.reset}`
        );
        console.log(apkPath);
      } else {
        console.log(
          `${colors.red}❌ No se pudo encontrar el archivo APK en la ubicación esperada: ${apkPath}${colors.reset}`
        );
      }
    } catch (apkError) {
      console.error(
        `${colors.red}❌ Error durante la compilación de la APK: ${apkError.message}${colors.reset}`
      );
      return process.exit(1);
    }

    console.log(
      `${colors.green}✅ Proceso de generación de APK completado exitosamente${colors.reset}`
    );
  } catch (error) {
    console.error(
      `${colors.red}❌ Error inesperado: ${error.message}${colors.reset}`
    );
    console.error(`${colors.red}❌ Stack: ${error.stack}${colors.reset}`);
    return process.exit(1);
  }
}

// Ejecutar la función principal y manejar errores
console.log("🚀 Iniciando script de generación de APK...");

generateApk().catch((error) => {
  console.error(`❌ Error global: ${error.message}`);
  console.error(`❌ Stack: ${error.stack}`);
  process.exit(1);
});

console.log("✅ Script de generación de APK finalizado");
