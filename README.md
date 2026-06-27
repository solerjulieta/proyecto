# Plataforma de Eventos e Inscripciones - API

## Temática

API REST para gestión de eventos y sus inscripciones. Esta entrega implementa autenticación centralizada con Passport.js: registro, login, ruta protegida /current y logout, usando JWT almacenado en cookies HTTP Only.

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
├── services/     # Lógica de negocio
├── repositories/ # Abstracción de acceso a datos
├── dao/          # Acceso a datos con Mongoose
├── models/       # Modelos (User, Event)
├── middlewares/  # Middlewares personalizados (passport.middleware.js)
├── dto/          # Data Transfer Objects (CurrentUserDTO)
└── utils/        # Utilidades (hash.js, jwt.js)
\`\`\`

## Rutas disponibles

Método | Ruta                   | Descripción                        | Protegida 
GET    | /api/health            | Estado del servidor                | No
GET    | /api/events            | Lista de eventos (vacía por ahora) | No
POST   | /api/sessions/register | Registro de usuarios               | No
POST   | /api/sessions/login    | Login, genera JWT y cookie         | No
GET    | /api/sessions/current  | Usuario autenticado actual         | Sí (estrategia JWT de Passport)
POST   | /api/sessions/logout   | Cierra sesión, elimina cookie      | No

## Modelo User

Campo      | Tipo   | Detalle
first_name | String | Requerido
last_name  | String | Requerido
email      | String | Requerido, único, normalizado (trim + lowercase)
password   | String | Requerido, almacenado como hash (bcrypt)
role       | String | Por defecto 'user', valores posibles: 'user', 'organizer', 'admin'. El campo 'role' no puede ser definido por el cliente al registrarse: siempre se asigna 'user' por defecto, sin importar lo que se envíe en el body.

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

## Flujo completo de prueba

1. POST /api/sessions/register  → 201, usuario creado sin password en respuesta
2. POST /api/sessions/login     → 200, cookie currentUser seteada
3. GET  /api/sessions/current   → 200, devuelve { id, first_name, last_name, email, role }
4. POST /api/sessions/logout    → 200, cookie eliminada
5. GET  /api/sessions/current   → 401, "No autenticado."

## Casos validados

1. Registro exitoso con datos válidos → 201.
2. Campos faltantes (first_name, last_name, email o password) → 400.
3. Email con formato inválido → 400.
4. Email ya registrado → 409.
5. La contraseña se guarda hasheada en MongoDB (nunca en texto plano).
6. La respuesta del registro no incluye el campo `password` en ningún caso.
7. Login exitoso → genera cookie con JWT.
8. Login con email inexistente → 401, mensaje genérico.
9. Login con contraseña incorrecta → 401, mismo mensaje genérico.
10. GET /current sin cookie → 401.
11. GET /current con token manipulado o expirado → 401.
12. Flujo completo: registro → login → current → logout → current devuelve 401.

## Arquitectura

El flujo de la lógica sigue el patrón en capas:

\`\`\`
ruta → passport.middleware -> passport.config (estrategia) → service → repository -> dao → modelo -> controller (HTTP + cookie)
\`\`\`

- **routes**: define el endpoint, delega en `passportAuth()` y luego al controller.
- **passport.config.js**: centraliza las tres estrategias (`register`, `login`, `current`). No genera JWT - eso le corresponde al controller.
- **passport.middleware.js**: envuelve `passport.authenticate()` con manejo de errores en formatos JSON.
- **controllers**: maneja `req`/`res`, setea la cookie y formatea la respuesta HTTP.
- **services**: lógica de negocio (validaciones, normalización, hash, generación de JWT).
- **repository**: abstrae el acceso a datos, delega al DAO.
- **dao**: interactúa directamente con Mongoose/MongoDB.
- **models**: define el esquema `User` con Mongoose.
- **dto/current-user.dto.js**: `CurrentUserDTO` - garantiza que `password` nunca se incluya en ninguna respuesta.
- **utils**: 
  - `hash.js` - hash y comparación de contraseñas con `brypt`.
  - `jwt.js` - generación y verificación de tokens JWT.

## Preparación para futuras estrategias

El archivo `passport.config.js` está estructurado para agregar nuevas estrategias sin modificar `app.js`. Por ejemplo, autenticación con proveedores externos.

El sistema queda preparado para incorporar providers externos como Google, GitHub u otros proveedores OAuth en futuras entregas, sin impacto en las rutas ni en `app.js`.

## Seguridad

- Las contraseñas se hashean con `bcrypt` antes de guardarse — nunca se almacena texto plano.
- El campo `role` no puede modificarse desde el body del registro — siempre se asigna `'user'`.
- El JWT solo contiene `{ id, email, role }` — nunca la contraseña.
- La cookie `currentUser` es `httpOnly`, no accesible desde JavaScript del cliente (protección contra XSS).
- Los mensajes de error de login son genéricos (`"Credenciales inválidas."`) para no revelar si el email existe o no.
- `JWT_SECRET` se carga desde variables de entorno, nunca hardcodeado en el código.
- `CurrentUserDTO` garantiza por diseño que `password` nunca aparece en ninguna respuesta.

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
