# Bitácora de Desarrollo — Task Management API

## Resumen del proceso

El desarrollo se organizó en bloques funcionales, probando y haciendo commit de cada uno antes de avanzar al siguiente: registro de usuarios → login/JWT → middleware de autenticación → CRUD de tareas → manejo de errores centralizado → validación con AJV → documentación Swagger → README.

## Uso de Asistentes de IA

Se utilizó IA (Claude, de Anthropic) como asistente durante todo el desarrollo, principalmente para: generar el código base de cada capa siguiendo la arquitectura definida, explicar el porqué de cada decisión, y depurar errores.

### Ejemplo 1 — Implementación del registro de usuario

**Prompt utilizado (resumen):** se pidió construir el endpoint `POST /auth/register` siguiendo la arquitectura en capas (route → controller → service → persistence), con hash de contraseña mediante bcrypt.

**Qué se aceptó y por qué:** se aceptó la estructura de las 4 capas tal como fue generada, porque respeta exactamente la separación de responsabilidades que exige la prueba: el repositorio solo ejecuta SQL parametrizado (sin concatenar strings, previniendo inyección SQL), el service contiene la única lógica de negocio (verificar email duplicado, hashear con `bcrypt.hash(password, 10)`), y el controller solo orquesta el request/response.

**Qué se verificó:** se probó el endpoint con `Invoke-RestMethod`, confirmando en PostgreSQL directamente (`SELECT password FROM users`) que la contraseña se almacenaba como hash bcrypt (`$2b$10$...`) y no en texto plano, que es un requisito explícito de la prueba.

**Qué se rechazó/modificó:** ninguna modificación sustancial en este bloque; el código generado se ajustaba a lo pedido.

### Ejemplo 2 — Resolución de conflicto de configuración de TypeScript

**Contexto:** al implementar la validación con AJV, el proyecto empezó a mostrar decenas de errores de TypeScript (`verbatimModuleSyntax`, `Cannot find module`) que no correspondían con errores reales de lógica.

**Qué se rechazó:** la primera sugerencia de la IA fue cambiar `"type": "commonjs"` a `"type": "module"` en `package.json` para alinearlo con `"module": "nodenext"` del `tsconfig.json`. Se aceptó inicialmente, pero esto generó una cascada mucho mayor de errores (Node exigiendo extensión `.js` en cada import relativo), así que se **revirtió por completo** con `git reset --hard` a un commit estable anterior.

**Verificación que llevó a la causa raíz real:** se ejecutó `npx tsc --noEmit` directamente por terminal (en vez de confiar solo en el panel de errores del editor, que mostraba información inconsistente/cacheada) y esto reveló el verdadero problema: el proyecto tenía instalado `typescript@^7.0.2`, una versión experimental/preview, cuyas reglas de módulos no son compatibles con la configuración estándar documentada para proyectos Node.js + Express.

**Solución aplicada:** downgrade a `typescript@5.7.3` (versión estable) y simplificación del `tsconfig.json` a una configuración clásica (`module: commonjs`, `moduleResolution: node`, `esModuleInterop: true`), eliminando opciones experimentales (`verbatimModuleSyntax`, `exactOptionalPropertyTypes`) que generaban fricción sin aportar valor real al alcance de esta prueba.

**Aprendizaje documentado:** ante errores inconsistentes entre editor y ejecución real, verificar siempre con el compilador directamente (`tsc --noEmit`) en vez de fiarse únicamente de la UI del editor.

## Decisiones tomadas sin asistencia de IA

1. **Nombres de columnas de base de datos en inglés, valores del enum en español.** Se decidió que las columnas de la tabla `tasks` (`title`, `description`, `due_date`, `status`) siguieran la convención estándar de la industria en inglés, mientras que los valores permitidos de `status` (`'pendiente'`, `'en curso'`, `'completada'`) se mantuvieron en español porque así los especifica textualmente el enunciado de la prueba — priorizando el cumplimiento literal del requisito funcional sobre la consistencia idiomática total.

2. **Elección de validación manual vs. reintentar AJV tras el primer fallo de configuración.** Ante la primera cascada de errores de TypeScript al integrar AJV, se evaluó la alternativa de usar validación manual (sin librería) para no perder más tiempo. Se decidió finalmente resolver la causa raíz (downgrade de TypeScript) y sí completar la integración con AJV, priorizando cumplir la recomendación explícita de la prueba sobre la solución más rápida, una vez identificado que el problema era de configuración y no del enfoque de validación en sí.

## Retos y Soluciones

| Reto | Solución |
|---|---|
| Imports duplicados al copiar código manualmente entre archivos (ej. `auth.routes.ts`, `auth.controller.ts`) | Revisión línea por línea del archivo completo en vez de solo agregar fragmentos; reemplazo del archivo entero para evitar líneas repetidas |
| Conflicto entre `verbatimModuleSyntax` y CommonJS | Downgrade de TypeScript a versión estable y simplificación del `tsconfig.json` (ver Ejemplo 2 arriba) |
| Panel de errores del editor mostrando información desincronizada/cacheada | Verificación cruzada con `npx tsc --noEmit` por terminal como fuente de verdad |