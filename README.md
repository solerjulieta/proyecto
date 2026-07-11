# Plataforma de Eventos e Inscripciones - API

## Temática

API REST para gestión de eventos e inscripciones con sistema de autorización por roles. Implementa autenticación con JWT y cookies HTTP Only, Passport.js para centralizar estrategias de autenticación, control de acceso basado en roles y CRUD completo de eventos con validaciones de negocio, filtros, paginación y ordenamiento.

## Tecnologías

- Node.js
- Express
- dotenv
- ES Modules
- MongoDB (Mongoose)
- bcrypt
- jsonwebtoken
- cookie-parser
- passport
- passport-local
- passport-jwt

## Instalación

\`\`\`bash
git clone <url-del-repo>
cd proyecto
npm install
\`\`\`

## Variables de entorno

Crear un archivo .env basado en .env.example

\`\`\`
PORT=8080
MONGO_URL=mongodb+srv://<usuario>:<password>@cluster0.xxxxx.mongodb.net/<nombre-db>
JWT_SECRET=tu_clave_secreta_aqui
JWT_EXPIRES_IN=1h
NODE_ENV=development
\`\`\`

> `JWT_SECRET` debe ser una cadena larga y aleatoria. Se puede generar con:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

## Ejecución

\`\`\`bash
npm start

# o en modo desarrollo

npm run dev
\`\`\`

El servidor corre en http://localhost:8080 (o el puerto definido en PORT).

## Estructura de carpetas

\`\`\`
src/
├── config/       # Configuración (variables de entorno, MongoDB, Passport)
├── routes/       # Definición de rutas
├── controllers/  # Lógica de manejo de requests
├── services/     # Lógica de negocio y validaciones
├── repositories/ # Abstracción de acceso a datos
├── dao/          # Acceso a datos con Mongoose
├── models/       # Modelos (User, Event)
├── middlewares/  # auth, authorize, isEventOwnerOrAdmin, passport
├── dto/          # Data Transfer Objects (CurrentUserDTO)
└── utils/        # Utilidades (hash.js, jwt.js)
\`\`\`

## Roles del sistema

Rol       | Descripción
user      | Rol por defecto al registrarse. Solo puede consultar eventos publicados.
organizer | Puede crear eventos y modificar/cancelar los suyos propios. 
admin     | Acceso total. Puede modificar cualquier evento y ver todos los usuarios. 

> El registro público siempre asigna `role: "user"`. No es posible crear un `organizer` o `admin` desde el endpoint de registro.

## Matriz de permisos

Acción                               user    organizer    admin
Consultar eventos publicados       |  ✓   |     ✓      |   ✓
Crear eventos                      |  ✖   |     ✓      |   ✓
Modificar/cancelar eventos propios |  ✖   |     ✓      |   ✓
Modificar cualquier evento         |  ✖   |     ✖      |   ✓
Ver todos los usuarios             |  ✖   |     ✖      |   ✓

## Diferencias entre 401 y 403

Código             Significado                                 Cuándo ocurre
401 Unauthorized | No hay sesión válida - no sabemos quién es | Sin cookie, token expirado o manipulado
403 Forbidden    | Hay sesión pero sin permisos suficientes   | `user` intentando crear un evento, `organizer` intentando ver todos los usuarios

## Rutas disponibles

Método | Ruta                    | Descripción                        | Protegida                      | Roles permitidos
GET    | /api/health             | Estado del servidor                | No                             | -
POST   | /api/sessions/register  | Registro de usuarios               | No                             | -
POST   | /api/sessions/login     | Login, genera JWT y cookie         | No                             | -
GET    | /api/sessions/current   | Usuario autenticado actual         | Sí                             | Cualquier rol
POST   | /api/sessions/logout    | Cierra sesión, elimina cookie      | No                             | -
GET    | /api/events             | Lista de eventos                   | No                             | -
GET    | /api/events/:id         | Detalle de un evento               | No                             | -
POST   | /api/events             | Crear evento                       | Sí                             | `organizer`, `admin`
PUT    | /api/events/:id         | Modificar evento                   | Sí                             | `organizer` (solo propios), `admin`
PATCH  | /api/events/:id/status  | Cambiar estado del evento          | Sí                             | `organizer` (solo propios), `admin`
DELETE | /api/events/:id         | Cancelar evento                    | Sí                             | `organizer` (solo propios), `admin`
GET    | /api/events/admin/users | Ver todos los usuarios             | Sí                             | `admin`

## Middlewares de autenticación y authorización

`auth.middleware.js` - autenticación (401)
Lee el JWT desde la cookie `currentUser`, lo verifica y puebla `req.user`. Si no hay cookie o el token es inválido/expirado, responde `401`.

Sin cookie -> 401 "No autenticado."
Token inválido -> 401 "Token inválido o expirado."
Token válido -> req.user = { id, email, role } -> next()

`authorize.middleware.js` - autorización por rol (403)
Recibe los roles permitidos como parámetro y compara `req.user.role`. Si el rol no está permitido, responde `403`.

// Uso en rutas:
router.post('/', auth, authorize('organizer', 'admin'), createEventHandler)
router.get('/admin/users', auth, authorize('admin'), getAllUsers)

`event.middleware.js` - propiedad del recurso (403)
Verifica que el `organizer` solo pueda modificar sus propios eventos. El `admin` puede modificar cualquiera.

organizer + evento propio -> next()
organizer + evento ajeno -> 403 "No tenés permisos para modificar este evento."
admin -> next() (sin restrincción)

## Modelo User

Campo      | Tipo   | Detalle
first_name | String | Requerido
last_name  | String | Requerido
email      | String | Requerido, único, normalizado (trim + lowercase)
password   | String | Requerido, almacenado como hash (bcrypt)
role       | String | Por defecto 'user', valores posibles: 'user', 'organizer', 'admin'. El campo 'role' no puede ser definido por el cliente al registrarse: siempre se asigna 'user' por defecto, sin importar lo que se envíe en el body.

## Modelo Event

Campo       | Tipo     | Detalle
title       | String   | Requerido
description | String   | Requerido
category    | String   | Requerido
date        | Date     | Requerido. No puede ser una fecha pasada
location    | String   | Requerido
capacity    | Number   | Requerido. Debe ser mayor a 0
price       | Number   | Requerido. No puede ser negativo
status      | String   | `draft`, `published`, `cancelled`, `finished`. Default `published`
organizer   | ObjectId | Referencia al `User` que creó el evento. Se asigna automáticamente desde `req.user`

## Registro de usuarios - `POST /api/sessions/register`

Gestionado por la estrategia `register` de Passport (LocalStrategy)

### Body esperado (JSON)

\`\`\`json
{
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan.perez@example.com",
  "password": "minimo6caracteres"
}
\`\`\`

### Validaciones

- `first_name`, `last_name`, `email` y `password` son obligatorios.
- `email` debe tener un formato válido.
- `password` debe cumplir con la longitud mínima requerida (6 caracteres).
- El `email` se normaliza (trim + lowercase) antes de guardarse.
- Si el `email` ya está registrado, se rechaza la solicitud.
- La contraseña se almacena hasheada con `bcrypt` (helper en `utils/hash.js`).
- La respuesta nunca incluye el campo `password`, ni en texto plano ni hasheado.
- El `role` enviado en el body es ignorado - siempre se asigna `'user'`

### Respuestas

**201 Created** — Registro exitoso

\`\`\`json
{
  "status": "success",
  "payload": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan.perez@example.com",
    "role": "user"
  }
}
\`\`\`

**400 Bad Request** — Campos faltantes o formato inválido (email inválido, contraseña muy corta)

\`\`\`json
{
  "status": "error",
  "message": "El formato del email es inválido."
}
\`\`\`

**409 Conflict** — Email ya registrado

\`\`\`json
{
  "status": "error",
  "message": "Ya existe un usuario registrado con este email."
}
\`\`\`

### Cómo probar el endpoint

Con el servidor corriendo, enviar una petición `POST` a `http://localhost:8080/api/sessions/register` con `Content-Type: application/json`.

### Casos validados

1. Registro exitoso con datos válidos → `201`.
2. Campos faltantes (`first_name`, `last_name`, `email` o `password`) → `400`.
3. Email con formato inválido → `400`.
4. Email ya registrado → `409`.
5. La contraseña se guarda hasheada en MongoDB (nunca en texto plano).
6. La respuesta del endpoint no incluye el campo `password` en ningún caso.

**Ejemplo con cURL:**

\`\`\`bash
curl -X POST http://localhost:8080/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan.perez@example.com",
    "password": "minimo6caracteres"
  }'
\`\`\`

También se puede probar con Postman, Insomnia o Thunder Client, usando el mismo body y método.


## Login - `POST /api/sessions/login`

Gestionado por la estrategia `login` de Passport (LocalStrategy). Tras la autenticación exitosa, el controller (no Passport) genera el JWT y setea la cookie.

### Body esperado (JSON)

\`\`\`json
{
  "email": "juan.perez@example.com",
  "password": "minimo6caracteres"
}
\`\`\`

### Validaciones

- `email` y `password` son obligatorios.
- Busca el usuario por email y compara la contraseña con bcrypt.
- Si el email no existe o la contraseña no coincide, responde siempre el mismo mensaje genérico `Credenciales inválidas` - no se especifica cuál de los dos falló, por seguridad.
- Si las credenciales son correctas, genera un JWT firmado con JWT_SECRET, con payload `{ id, email, role }` y expiración configurable (`JWT_EXPIRES_IN`).
- El token se guarda en una cookie llamada `currentUser` con las siguientes opciones:
  - `httpOnly: true` - no accesible desde JavaScript del navegador
  - `sameSite: 'lax'`
  - `maxAge: 3600000` (1 hora)
  - `secure: true` solo en producción (`NODE_ENV === 'production'`)

### Respuestas

**200 OK** — Login exitoso

\`\`\`json
{
  "status": "success",
  "message": "Login exitoso."
}
\`\`\`

(la cookie currentUser se setea automáticamente en la respuesta)

**401 Unauthorized** — Credenciales inválidas (email inexistente o contraseña incorrecta)

\`\`\`json
{
  "status": "error",
  "message": "Credenciales inválidas."
}
\`\`\`

**400 Bad Request** — Campos faltantes

\`\`\`json
{
  "status": "error",
  "message": "El email y contraseña son obligatorios."
}
\`\`\`

### Cómo probar el endpoint

Con el servidor corriendo, enviar una petición `POST` a `http://localhost:8080/api/sessions/login` con `Content-Type: application/json`.

En Postman: asegurarse de que "Send cookies" esté habilitado en la pestaña Settings para que la cookie persista entre requests.

**Ejemplo con cURL:**

\`\`\`bash
curl -X POST http://localhost:8080/api/sessions/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan.perez@example.com",
    "password": "minimo6caracteres"
  }'
\`\`\`

En Postman: asegurarse de que "Send cookies" esté habilitado en Settings para que la cookie persista entre requests.

## Usuario actual - `GET /api/sessions/current`

Ruta protegida por la estrategia `current` de Passport (JwtStrategy). Lee el token desde la cookie `currentUser`, lo verifica y deja el payload en `req.user`.

### Respuestas

**200 OK** — Usuario autenticado (nunca incluye `password`)

\`\`\`json
{
  "status": "success",
  "payload": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan.perez@example.com",
    "role": "user"
  }
}
\`\`\`

(nunca incluye password)

**401 Unauthorized** — Sin cookie

\`\`\`json
{
  "status": "error",
  "message": "No autenticado."
}
\`\`\`

**401 Unauthorized** — Token inválido o expirado

\`\`\`json
{
  "status": "error",
  "message": "Token inválido o expirado."
}
\`\`\`

### Cómo probar el endpoint

Con el servidor corriendo, enviar una petición `GET` a `http://localhost:8080/api/sessions/current` con `Content-Type: application/json`.

## Logout - `POST /api/sessions/logout`

Elimina la cookie `currentUser`. No requiere pasar por Passport.

### Respuestas

**200 OK** 

\`\`\`json
{
  "status": "success",
  "message": "Sesión cerrada correctamente."
}
\`\`\`

### Cómo probar el endpoint

Con el servidor corriendo, enviar una petición `POST` a `http://localhost:8080/api/sessions/logout` con `Content-Type: application/json`.

Después del logout, un nuevo GET /api/sessions/current con la misma cookie debe responder 401.

## Endpoints de eventos

Ver eventos `GET /api/events`
Pública. Soporta filtros, paginación y ordenamiento.

## Query params disponibles: 

Parámetro  | Tipo   | Descripción                              | Ejemplo
`status`   | String | Filtra por estado (case insensitive)     | `?status=published`
`category` | String | Filtra por categoría (case insensitive)  | `?category=workshop`
`location` | String | Filtra por ubicación (case insensitive)  | `?location=córdoba`
`dateFrom` | Date   | Filtra eventos desde esta fecha          | `?dateFrom=2026-01-01`
`dateTo`   | Date   | Filtra eventos hasta esta fecha          | `?dateTo=2026-12-31`
`page`     | Number | Página actual (default: 1)               | `?page=2`
`limit`    | Number | Resultados por página (default: 10)      | `?limit=5`
`sort`     | String | Campo por el que ordenar (default: date) | `?sort=date`

## Ejemplo de request con filtros: 

\`\`\`
GET /api/events?status=published&category=workshop&page=2&limit=5
GET /api/events?dateFrom=2026-01-01&dateTo=2026-12-31$sort=date
\`\`\`

## 200 OK 

{
  "status": "success",
  "data": [...],
  "page": 2,
  "limit": 5,
  "total": 23,
  "totalPages": 5
}

## Detalle de evento - `GET /api/events/:id`

Pública.

## **200 OK:** evento con datos del organizer (sin password) | **404:** evento no encontrado

--

## Crear evento - `POST /api/events`

Requiere autenticación y rol `organizer` o `admin`. El `organizer` del evento se asigna automáticamente desde el req.user.id - no puede venir del body.

{
  "title": "Festival de Música 2026",
  "description": "Festival al aire libre con bandas locales",
  "category": "festival",
  "date": "2026-09-15T18:00:00.000Z",
  "location": "Parque Sarmiento, Córdoba",
  "capacity": 500,
  "price": 1500
}

**201 Created:** evento creado con `status: 'draft'` por defecto

**400:** validación fallida | **401:**: sin sesión | **403:** rol insuficiente

--

## Modificar evento `PUT /api/events/:id`

Requiere autenticación y rol `organizer` o `admin`. El `organizer` solo puede modificar sus propios eventos. No se puede modificar un evento cancelado. El campo `organizer` no puede cambiarse desde el body.

**400:** evento cancelado o fecha pasada | **401:** sin sesión | **403:** sin permisos o evento ajeno | **404:** evento no encontrado

--

## Cambiar estado - `PATCH /api/events/:id/status`

Requiere autenticación y rol `organizer` o `admin`.

**Body**
```json
{ "status": "published" }
```

**Estados válidos**: `draft`, `published`, `cancelled`, `finished`

**Reglas de negocio:**
- Un evento `cancelled` no puede cambiar de estado
- Un evento `finished` no puede publicarse nuevamente

**200 OK:** evento con estado actualizado | **400:** estado inválido o transición no permitida | **403:** evento ajeno

--

## Cancelar evento - `DELETE /api/events/:id`

Requiere autenticación y rol `organizer` o `admin`. El `organizer` solo puede cancelar sus propios eventos. No elimina el evento físicamente - cambia su `status` a `'cancelled'`.

**200 OK:**
```json
{ "status": "success", "message": "Evento cancelado correctamente." }
```

**403:** sin permisos o evento ajeno | **404:** evento no encontrado

--

## Ver todos los usuarios - `GET /api/events/admin/users`

Ruta administrativa. Solo accesible por `admin`. Devuelve todos los usuarios sin incluir `password`.

**200 OK:** 

{
  "status": "success",
  "payload": [...]
}

**401:** sin sesión | **403:** rol insuficiente

--

## Reglas de negocio

Todas las validaciones viven en la capa `services`, nunca en rutas ni controllers.

Regla                                                 | Error 
Fecha del evento en el pasado                         | 400
`capacity` igual a 0 o negativo                       | 400
`price` negativo                                      | 400
`title`, `description`, `category`, `location` vacíos | 400
Modificar evento cancelado                            | 400
Publicar evento finalizado                            | 400
Estado inválido en PATCH                              | 400
`organizer` en body ignorado en POST y PUT            | -
Eventos nunca eliminados físicamente                  | -

--

## Flujo completo de prueba

1. POST /api/sessions/register              → 201, role: 'user'
2. POST /api/sessions/login                 → 200, cookie seteada
3. POST /api/events                         → 403, user no puede crear
4. (cambiar role a 'organizer' en Atlas)
5. POST /api/sessions/login                 → 200, nueva cookie
6. POST /api/events                         → 201, evento creado (status: published)
7. PATCH /api/events/:id/status             → 200, status: published
8. PUT  /api/events/:id (evento propio)     → 200, evento modificado
9. PUT  /api/events/:id (evento ajeno)      → 403
10. DELETE /api/events/:id                  → 200, status: cancelled
11. PATCH /api/events/:id/status            → 400, no se puede modificar evento cancelado
12. GET /api/events?status=published&page=1 → 200, con paginación
13. POST /api/sessions/logout               → 200, cookie eliminada
14. GET /api/sessions/current               → 401


## Casos validados

1. Crear evento con rol `user` -> `403`
2. Crear evento fecha pasada `user` -> `400`
3. Crear evento con `capacity: 0` -> `400`
4. Crear evento con `price` negativo -> `400`
5. `organizer` modifica envento propio -> `200`
6. `organizer` modifica envento ajeno -> `403`
7. `admin` modifica envento de otro organizer -> `400`
8. Cambiar estado de evento cancelado -> `400`
9. Publicar evento finalizado -> `400`
10. Listar con filtros `?status=published&category=workshop&page=2&limit=5`-> `200`
11. Consultar evento inexistente -> `404`
12. Registro exitoso → `201`
13. Login con credenciales inválidas -> `401`, mensaje genérico
14. `GET /current` sin cookie -> `401`
15. Flujo completo: registro -> login -> current -> logout -> current devuelve `401`

--

## Arquitectura

El flujo de la lógica sigue el patrón en capas:

\`\`\`
ruta → middleware (auth + authorize + isEventOwnerOrAdmin)
     → passport.config (estrategia)
     → controller (solo HTTP)
     → service (lógica de negocio + validaciones)
     → repository
     → dao
     → modelo (Mongoose)
\`\`\`

- `passport.config.js`: estrategias `register`, `login` y `current`. No genera JWT.
- `auth.middleware.js`: valida JWT → `401` si no hay sesión.
- `authorize.middleware.js`: valida rol → `403` si no tiene permisos.
- `event.middleware.js`: valida propiedad del evento → `403` si es ajeno.
- `dto/current-user.dto.js`: garantiza que `password` nunca aparece en respuestas.
- `utils/hash.js`: hash y comparación de contraseñas con `bcrypt`.
- `utils/jwt.js`: generación y verificación de tokens JWT.

## Preparación para futuras estrategias

El archivo `passport.config.js` está estructurado para agregar nuevas estrategias sin modificar `app.js`. Por ejemplo, autenticación con proveedores externos.

El sistema queda preparado para incorporar providers externos como Google, GitHub u otros proveedores OAuth en futuras entregas, sin impacto en las rutas ni en `app.js`.

## Seguridad

- Las contraseñas se hashean con `bcrypt` antes de guardarse — nunca se almacena texto plano.
- `role` siempre `'user'` en registro - no manipulable desde el body.
- `organizer` siempre asignado desde `req.user` - no manipulable desde el body.
- JWT solo contiene `{ id, email, role }` — nunca la contraseña.
- Cookie `httpOnly` - protección contra XSS.
- Mensajes de error de login genéricos (`"Credenciales inválidas."`) para no revelar si el email existe o no.
- `JWT_SECRET` se carga desde variables de entorno, nunca hardcodeado en el código.
- `CurrentUserDTO` garantiza por diseño que `password` nunca aparece en ninguna respuesta.
- Usuarios devueltos por `/admin/users` excluyen el campo `password`.
- Eventos nunca eliminados físicamente - se cancelan cambiando el estado.

--

## Calidad de código y testing

Este proyecto utiliza **ESLint** y **Prettier** para mantener un estilo de código consistente.

\`\`\`bash
# Revisar errores de estilo
npm run lint

# Corregir automáticamente
npm run lint:fix

# Formatear el código con Prettier
npm run format
\`\`\`

### Tests

Se utiliza el test runner nativo de Node.js para validar los endpoints.

\`\`\`bash
npm test
\`\`\`
