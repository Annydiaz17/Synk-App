# Synk App - Todo en Sincronia

Aplicacion moderna de lista de tareas (To-Do List) desarrollada con **Ionic 8 + Angular 20**.

## Caracteristicas

- **Gestion de Tareas:** Crear, completar (tachado), eliminar con swipe y reordenar con drag & drop
- **Gestion de Categorias:** Crear categorias con nombre y color, eliminar, conteo de tareas en tiempo real
- **Filtrado:** Filtrar tareas por categoria con chips interactivos
- **Firebase Remote Config:** Feature flag `show_priority_feature` para mostrar/ocultar campo de prioridad (Alta/Media/Baja)
- **Persistencia:** Almacenamiento local con localStorage
- **Optimizacion:** OnPush change detection, trackBy en listas, lazy loading, BehaviorSubject para estado reactivo

## Stack Tecnologico

| Tecnologia | Version |
|------------|---------|
| Angular | 20 |
| Ionic Framework | 8 |
| Capacitor | 8 |
| Firebase JS SDK | 11+ |
| TypeScript | 5.8 |

## Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Teal | `#00D4C8` | Primary |
| Indigo | `#6366F1` | Secondary |
| Purple | `#A855F7` | Tertiary |
| Yellow | `#FACC15` | Warning / Accent |
| Light BG | `#F3F4FF` | Fondo claro |
| Dark BG | `#0F172A` | Fondo oscuro |

## Requisitos Previos

- Node.js 18+ (LTS recomendado)
- npm 9+
- Ionic CLI: `npm install -g @ionic/cli`
- JDK 21 (para compilar Android)
- Android Studio (para generar APK)
- Xcode (para generar IPA, solo macOS)

## Instalacion

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/Synk-App.git
cd Synk-App

# Instalar dependencias
npm install

# Instalar Firebase SDK
npm install firebase
```

## Ejecucion en Desarrollo

```bash
# Iniciar servidor de desarrollo
ionic serve
```

La app estara disponible en `http://localhost:8100`

## Configuracion de Firebase (Opcional)

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Copia tu configuracion en `src/environments/environment.ts`
3. En Firebase Console, ve a **Remote Config** y crea el parametro:
   - Clave: `show_priority_feature`
   - Valor: `true` (para habilitar prioridad) o `false`
4. La app funciona al 100% sin Firebase - el campo de prioridad simplemente estara oculto

## Compilacion para Android

```bash
# 1. Compilar la app para produccion
ionic build --prod

# 2. Agregar plataforma Android (solo la primera vez)
npm install @capacitor/android
npx cap add android

# 3. Sincronizar archivos web
npx cap sync android

# 4. Abrir en Android Studio
npx cap open android
```

### Generar APK desde terminal

```bash
cd android
.\gradlew.bat assembleDebug
```

El APK se genera en: `android/app/build/outputs/apk/debug/app-debug.apk`

### Generar APK firmado (release)

En Android Studio: **Build > Generate Signed Bundle / APK > APK**

## Compilacion para iOS (requiere macOS)

```bash
# 1. Compilar
ionic build --prod

# 2. Agregar plataforma iOS (solo la primera vez)
npm install @capacitor/ios
npx cap add ios

# 3. Sincronizar
npx cap sync ios

# 4. Abrir en Xcode
npx cap open ios
```

En Xcode: seleccionar dispositivo/simulador y presionar **Run** o archivar para generar IPA.

## Estructura del Proyecto

```
src/
  app/
    models/
      task.model.ts          # Interfaces Task, Category, Priority
    services/
      task.service.ts         # CRUD de tareas y categorias (localStorage)
      firebase.service.ts     # Firebase Remote Config
    home/
      home.page.ts            # Pagina principal de tareas
      home.page.html          # Template con lista, filtros, reorder
      home.page.scss          # Estilos de la pagina principal
      home.module.ts          # Modulo con lazy loading
    pages/
      categories/
        categories.page.ts    # Gestion de categorias
        categories.page.html  # Template de categorias
        categories.page.scss  # Estilos de categorias
        categories.module.ts  # Modulo con lazy loading
  environments/
    environment.ts            # Config de desarrollo + Firebase
    environment.prod.ts       # Config de produccion + Firebase
  theme/
    variables.scss            # Paleta de colores Synk
  global.scss                 # Estilos globales, fuente Inter
  index.html                  # HTML principal con SEO
```

## Arquitectura

- **NgModules** (no standalone) con lazy loading
- **OnPush Change Detection** en todos los componentes
- **BehaviorSubject** para estado reactivo en servicios
- **trackBy** en todas las directivas `*ngFor`
- **Firebase JS SDK** directo (sin AngularFire) para compatibilidad con Angular 20

## Preguntas Tecnicas

### 1. Como se implemento el almacenamiento persistente?

Se utiliza `localStorage` del navegador a traves del `TaskService`. Las tareas y categorias se serializan como JSON y se guardan en claves separadas (`synk_tasks` y `synk_categories`). Cada operacion CRUD (agregar, eliminar, toggle, reordenar) actualiza automaticamente el localStorage y emite el nuevo estado via `BehaviorSubject`, manteniendo la UI sincronizada de forma reactiva.

### 2. Como funciona el feature flag de Firebase Remote Config?

El `FirebaseService` inicializa el SDK de Firebase al arrancar la app. Hace fetch de Remote Config y lee el parametro `show_priority_feature`. Si es `true`, se muestra el campo de prioridad (Alta/Media/Baja) al crear tareas y los badges de prioridad en cada tarea. Si Firebase no esta disponible o no esta configurado, el servicio hace fallback a `false` sin romper la app.

### 3. Que estrategias de optimizacion se aplicaron?

- **OnPush Change Detection:** Los componentes solo se re-renderizan cuando cambian sus inputs o se llama `markForCheck()`, reduciendo ciclos innecesarios de deteccion de cambios.
- **trackBy en ngFor:** Evita re-crear elementos del DOM al actualizar listas, mejorando el rendimiento al agregar/eliminar tareas.
- **Lazy Loading:** Las paginas se cargan bajo demanda (loadChildren), reduciendo el bundle inicial.
- **BehaviorSubject:** Permite notificacion reactiva de cambios sin polling ni deteccion manual.

## Licencia

MIT