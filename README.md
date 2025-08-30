# QRganize - Aplicación de Organización de Mudanzas

## 🎯 Descripción

QRganize es una aplicación móvil completa que ayuda a organizar mudanzas mediante el uso de códigos QR para identificar el contenido de las cajas.

## ✅ Funcionalidades Completadas

### Backend (NestJS)

- ✅ Autenticación y gestión de usuarios
- ✅ CRUD completo de cajas con validación
- ✅ CRUD completo de items dentro de cajas
- ✅ Generación automática de códigos QR únicos
- ✅ API REST documentada
- ✅ Manejo de archivos e imágenes
- ✅ Base de datos MySQL con TypeORM

### Frontend (Ionic Angular)

- ✅ Interfaz móvil responsive
- ✅ Gestión completa de cajas
- ✅ Gestión completa de items
- ✅ Scanner de códigos QR funcional
- ✅ Búsqueda avanzada de cajas
- ✅ Integración con cámara para fotos
- ✅ Navegación con tabs
- ✅ Modales para crear/editar
- ✅ Notificaciones toast

## 🚀 Próximas Mejoras

### Funcionalidades Adicionales

1. **Categorías de Items**: Clasificar objetos por tipo (ropa, libros, etc.)
2. **Estados de Mudanza**: Marcar cajas como empacadas, en tránsito, desempacadas
3. **Ubicaciones**: Asignar habitaciones de origen y destino
4. **Checklist de Mudanza**: Lista de tareas pendientes
5. **Compartir Cajas**: Colaboración entre usuarios
6. **Exportar/Importar**: Backup de datos
7. **Estadísticas**: Dashboard con métricas de la mudanza
8. **Notificaciones Push**: Recordatorios y alertas

### Mejoras Técnicas

1. **PWA**: Funcionalidad offline
2. **Sync**: Sincronización de datos offline/online
3. **Performance**: Lazy loading de imágenes
4. **Tests**: Pruebas unitarias e integración
5. **CI/CD**: Pipeline de despliegue automatizado
6. **Docker**: Containerización
7. **Monitoring**: Logs y métricas
8. **Security**: Auditoría de seguridad

### UX/UI

1. **Tema oscuro**: Modo dark/light
2. **Accesibilidad**: WCAG compliance
3. **Animaciones**: Transiciones suaves
4. **Gestos**: Swipe actions
5. **Filtros avanzados**: Múltiples criterios de búsqueda
6. **Tutorial**: Onboarding interactivo

## 🛠️ Instalación y Uso

### Requisitos Previos

- Node.js 18+
- MySQL 8+
- Android Studio / Xcode (para mobile)

### Backend

```bash
cd back
npm install
npm run start:dev
```

### Frontend

```bash
cd app
npm install
npm start
```

### Mobile

```bash
cd app
ionic capacitor add android
ionic capacitor run android
```

## 📚 Tecnologías Utilizadas

### Backend

- NestJS
- TypeORM
- MySQL
- JWT
- class-validator
- qrcode

### Frontend

- Ionic 7
- Angular 17
- Capacitor
- RxJS
- TypeScript

## 📱 Capturas de Pantalla

[Agregar capturas de pantalla aquí]

## 🤝 Contribuir

[Instrucciones para contribuir al proyecto]

## 📄 Licencia

[Especificar licencia]

---

_Desarrollado para facilitar mudanzas organizadas y sin estrés_
