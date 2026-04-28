# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos comunes

```bash
npm start          # Servidor de desarrollo en http://localhost:4200
npm run build      # Build de producción (artifacts en dist/)
npm test           # Ejecutar tests unitarios (Vitest)
npm run watch      # Build en modo watch (desarrollo)
```

Para generar componentes/servicios con Angular CLI, todos están configurados con `skipTests: true` por defecto (ver `angular.json` schematics).

## Backend

El backend debe estar corriendo en `http://localhost:8080`. Los endpoints de API son:
- `POST /api/auth/login` — autenticación (sin token)
- `POST /api/auth/registro` — registro (sin token)
- `GET|POST /api/*` — endpoints del club (requieren Bearer token en cabecera)

## Arquitectura

### Estructura de carpetas

```
src/app/
  core/           # Servicios globales de aplicación
    auth/         # AuthService (signals), AuthGuard
    notifications/# NotificationService, NotificationComponent, UiFeedbackService
    i18n/         # TranslateService, TranslatePipe, diccionario es.ts
  features/       # Lógica de negocio por dominio
    access/       # login/, register/ (páginas públicas de autenticación)
    marketing/    # landing/, waitlist/, services/
    club/         # dashboard, courts, reservations, configurator (páginas protegidas)
      shared/     # Modelos compartidos del club, ClubWorkspacePage base, ClubApiBase
  shared/
    navigation/   # Constantes de rutas (APP_ROUTE_SEGMENTS, APP_ROUTES)
    ui/           # Componentes reutilizables: sidebar, footer-bar, auth-shell, etc.
    utils/        # date.utils.ts, text.utils.ts, user.utils.ts
```

### Patrones clave

**Standalone components**: No hay NgModules. Cada componente importa sus dependencias directamente.

**Signals para estado**: Se usa `signal()` de Angular en lugar de RxJS Subjects.
- `AuthService.session = signal<AuthSession | null>()`
- `NotificationService.notifications = signal<Notification[]>()`

**Alias de paths**: Usar `@app/` en lugar de rutas relativas largas (configurado en `tsconfig.json`).

**Autenticación**: La sesión se persiste en `localStorage` con la clave `reservas-padel.auth-session`. El `authGuard` protege las rutas de `/dashboard`, `/calendar`, `/courts` y `/configurator`.

**Servicios de API del club**: Las clases que acceden al backend heredan de `ClubApiBase` (en `features/club/shared/data-access/club-api.base.ts`), que provee las cabeceras HTTP con el Bearer token.

**Notificaciones**: Usar `UiFeedbackService` (en `core/notifications/`) para mostrar mensajes de éxito/error ya traducidos, en lugar de llamar directamente a `NotificationService`.

**i18n**: Todas las cadenas visibles al usuario usan claves de traducción a través de `TranslatePipe` o `TranslateService`. El diccionario está en `core/i18n/es.ts`.

**Estilos**: Tailwind CSS 4.x es el framework principal de estilos (sin archivo de configuración `tailwind.config.js`, se gestiona a través de PostCSS).
