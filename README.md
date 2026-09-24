# Task Management API

API RESTful para gestión de tareas personales con autenticación JWT, construida con Node.js, Express, TypeScript y PostgreSQL.

## Arquitectura

El proyecto está organizado en capas, separando responsabilidades:

```text
src/
├── api/
│   ├── routes/          # Definición de endpoints (auth, tasks)
│   ├── middlewares/     # authenticate, validateBody, errorHandler
│   └── schemas/         # Esquemas de validación (AJV)
├── controllers/         # Reciben el request y llaman al service
├── services/            # Lógica de negocio
├── persistence/         # Comunicación con PostgreSQL
├── config/              # Configuración centralizada (env, swagger)
├── utils/               # Clases de error personalizadas
└── app.ts               # Punto de entrada de la aplicación
```

Flujo de una petición:

```text
Request
   ↓
Route
   ↓
Middleware (autenticación / validación)
   ↓
Controller
   ↓
Service
   ↓
Persistence / Repository
   ↓
PostgreSQL
```

### Decisiones de diseño

* **Separación por capas**: el controller no ejecuta SQL directamente ni contiene lógica de negocio; el service no conoce Express (`req`/`res`); el repository se encarga de la comunicación con la base de datos.

* **Manejo de errores centralizado**: se utilizan clases de error personalizadas (`NotFoundError`, `AuthenticationError`, `ValidationError`, `ConflictError`) que contienen su código HTTP y son procesadas por un middleware centralizado.

* **Aislamiento por usuario**: las operaciones sobre tareas filtran por `user_id` directamente en las consultas a PostgreSQL, evitando que un usuario pueda acceder a tareas pertenecientes a otro usuario.

* **Contraseñas protegidas**: las contraseñas nunca se almacenan en texto plano. Antes de guardarlas en PostgreSQL se procesan mediante `bcrypt`.

* **Autenticación basada en JWT**: después de iniciar sesión correctamente, el usuario recibe un JSON Web Token que debe utilizar para acceder a las rutas protegidas.

* **Nombres de columnas en inglés**: se utilizan nombres como `title`, `description`, `due_date` y `status`, mientras que los valores permitidos para `status` se mantienen en español (`pendiente`, `en curso`, `completada`) debido al requisito del enunciado.

## Tecnologías

* Node.js
* Express
* TypeScript
* PostgreSQL
* JWT (`jsonwebtoken`)
* bcrypt
* AJV
* `ajv-formats`
* Swagger (`swagger-jsdoc`)
* Swagger UI (`swagger-ui-express`)

## Requisitos previos

Antes de ejecutar el proyecto se necesita tener instalado:

* Node.js
* npm
* PostgreSQL
* Git

Se recomienda utilizar una versión LTS de Node.js.

## Instalación local

### 1. Clonar el repositorio

```bash
git clone https://github.com/josecoronadodev/task-management-api.git
cd task-management-api
```

### 2. Instalar las dependencias

```bash
npm install
```

### 3. Crear la base de datos

Crear una base de datos PostgreSQL llamada:

```text
task_management
```

Por ejemplo, desde `psql`:

```sql
CREATE DATABASE task_management;
```

Después conectarse a la base de datos y crear las tablas:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (status IN ('pendiente', 'en curso', 'completada')),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Configuración del `.env`

El proyecto utiliza variables de entorno para evitar almacenar credenciales directamente en el código.

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

Después completa los valores correspondientes a tu entorno local.

Variables requeridas:

| Variable         | Descripción                                        |
| ---------------- | -------------------------------------------------- |
| `PORT`           | Puerto donde corre el servidor, por defecto `3000` |
| `DB_HOST`        | Host de PostgreSQL                                 |
| `DB_PORT`        | Puerto de PostgreSQL, normalmente `5432`           |
| `DB_NAME`        | Nombre de la base de datos                         |
| `DB_USER`        | Usuario de PostgreSQL                              |
| `DB_PASSWORD`    | Contraseña del usuario de PostgreSQL               |
| `JWT_SECRET`     | Clave secreta utilizada para firmar los JWT        |
| `JWT_EXPIRES_IN` | Tiempo de expiración de los JWT                    |

Ejemplo de estructura:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_management
DB_USER=postgres
DB_PASSWORD=tu_password

JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=1h
```

## Ejecutar el proyecto

### Modo desarrollo

```bash
npm run dev
```

El servidor queda disponible en:

```text
http://localhost:3000
```

### Compilar el proyecto

Para comprobar que el código TypeScript puede compilarse correctamente:

```bash
npm run build
```

Los archivos compilados se generan en el directorio configurado para la salida de TypeScript.

### Ejecutar la versión compilada

Después de ejecutar `npm run build`:

```bash
npm start
```

## Health Check

El proyecto dispone de un endpoint para comprobar el estado de la API y la conexión con PostgreSQL:

```http
GET /health
```

Ejemplo de respuesta:

```json
{
  "status": "ok",
  "database": "connected",
  "time": "2026-09-24T02:00:00.000Z"
}
```

## Autenticación

La API utiliza JWT para proteger los endpoints relacionados con las tareas.

El flujo de autenticación es:

```text
Registro
   ↓
POST /auth/register
   ↓
Usuario creado con contraseña hasheada
   ↓
POST /auth/login
   ↓
Credenciales verificadas
   ↓
JWT generado
   ↓
JWT utilizado en las rutas protegidas
```

Las rutas protegidas requieren el siguiente header:

```http
Authorization: Bearer <token>
```

## Endpoints principales

| Método | Ruta             | Descripción                                      | Protegido |
| ------ | ---------------- | ------------------------------------------------ | --------- |
| POST   | `/auth/register` | Registra un nuevo usuario                        | No        |
| POST   | `/auth/login`    | Inicia sesión y devuelve un JWT                  | No        |
| POST   | `/tasks`         | Crea una tarea                                   | Sí        |
| GET    | `/tasks`         | Lista las tareas del usuario autenticado         | Sí        |
| GET    | `/tasks/:id`     | Obtiene una tarea específica                     | Sí        |
| PUT    | `/tasks/:id`     | Actualiza una tarea                              | Sí        |
| DELETE | `/tasks/:id`     | Elimina una tarea                                | Sí        |
| GET    | `/health`        | Comprueba el estado de la API y la base de datos | No        |

## Estados de las tareas

Las tareas utilizan los siguientes estados:

```text
pendiente
en curso
completada
```

Estos valores son validados tanto en la entrada de la API como en la definición de la tabla de PostgreSQL.

## Validación

Las solicitudes de la API son validadas mediante esquemas utilizando AJV.

La validación permite comprobar, entre otros aspectos:

* Campos obligatorios.
* Tipos de datos.
* Formato de correo electrónico.
* Valores permitidos para el estado de una tarea.
* Estructura esperada de las solicitudes.

Las solicitudes que no cumplen las reglas de validación son rechazadas mediante el sistema centralizado de errores.

## Manejo de errores

La aplicación utiliza un middleware centralizado para procesar los errores.

Se utilizan errores personalizados, entre ellos:

```text
NotFoundError
AuthenticationError
ValidationError
ConflictError
```

Las respuestas de error mantienen una estructura JSON consistente.

Ejemplo:

```json
{
  "error": {
    "message": "Resource not found",
    "statusCode": 404
  }
}
```

## Documentación de la API — Swagger

Con el servidor ejecutándose, acceder a:

```text
http://localhost:3000/api-docs
```

Swagger permite:

* Consultar todos los endpoints.
* Revisar los parámetros de cada solicitud.
* Consultar los esquemas de request/response.
* Probar los endpoints directamente.
* Autorizarse mediante JWT para probar las rutas protegidas.

Para utilizar las rutas protegidas:

1. Ejecutar `POST /auth/login`.
2. Obtener el JWT de la respuesta.
3. Pulsar **Authorize** en Swagger.
4. Introducir el token según el esquema configurado.
5. Ejecutar los endpoints protegidos.

## Seguridad

Entre las medidas implementadas se incluyen:

* Hash de contraseñas mediante `bcrypt`.
* Contraseñas nunca almacenadas en texto plano.
* Autenticación mediante JWT.
* Middleware para proteger las rutas privadas.
* Validación de los datos recibidos.
* Uso de variables de entorno para credenciales y secretos.
* Consultas parametrizadas a PostgreSQL.
* Aislamiento de las tareas mediante `user_id`.

## Scripts disponibles

### Desarrollo

```bash
npm run dev
```

Inicia el servidor en modo desarrollo utilizando `tsx`.

### Build

```bash
npm run build
```

Compila el proyecto TypeScript.

### Producción

```bash
npm start
```

Ejecuta la versión compilada del proyecto.

## Git y Conventional Commits

El proyecto utiliza Git para el control de versiones y Conventional Commits para mantener mensajes de commit consistentes.

Ejemplos:

```text
chore: initialize project
feat: add user registration
feat: add user login
feat: add jwt authentication middleware
feat: add task crud
fix: handle duplicate user email
docs: add Swagger documentation
test: add authentication tests
```

Los commits se realizan de manera incremental conforme se completan y verifican funcionalidades.

## Estructura del proyecto

```text
task-management-api/
├── src/
│   ├── api/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── schemas/
│   ├── config/
│   ├── controllers/
│   ├── persistence/
│   ├── services/
│   ├── utils/
│   └── app.ts
├── .env
├── .env.example
├── .gitignore
├── DEVELOPMENT_LOG.md
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json
```


## Flujo general de la aplicación

```text
                    ┌─────────────────┐
                    │     Cliente     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │     Routes      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Middlewares   │
                    │ Auth / Validate │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Controllers   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    Services     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Persistence   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    └─────────────────┘
```

## Estado del proyecto

Implementación de los requisitos principales de la prueba técnica:

* [x] Configuración inicial del proyecto.
* [x] TypeScript.
* [x] Express.
* [x] PostgreSQL.
* [x] Configuración mediante variables de entorno.
* [x] Registro de usuarios.
* [x] Hash de contraseñas con bcrypt.
* [x] Login.
* [x] Autenticación mediante JWT.
* [x] Middleware de autenticación.
* [x] CRUD de tareas.
* [x] Aislamiento de tareas por usuario.
* [x] Validación mediante AJV.
* [x] Manejo centralizado de errores.
* [x] Documentación Swagger.
* [x] JSDoc en funciones importantes.
* [x] Conventional Commits.
* [ ] Pruebas automatizadas adicionales.
* [ ] Despliegue online.

## Autor

**Jose Coronado**

