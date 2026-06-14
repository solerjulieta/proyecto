# Plataforma de Eventos e Inscripciones - API

## Temática

API REST para gestión de eventos y sus inscripciones. Esta entrega implementa el registro seguro de usuarios.

## Tecnologías

- Node.js
- Express
- dotenv
- ES Modules
- MongoDB (Mongoose)
- bcrypt

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
MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster0.xxxxx.mongodb.net/<nombre-db>
PERSISTENCE=db
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
├── config/ # Configuración (variables de entorno)
├── routes/ # Definición de rutas
├── controllers/ # Lógica de manejo de requests
├── services/ # Lógica de negocio
├── repositories/ # Abstracción de acceso a datos
├── dao/ # Acceso a datos
├── models/ # Modelos (User, Event)
├── middlewares/ # Middlewares personalizados
└── utils/ # Utilidades (hash de contraseñas, etc.)
\`\`\`

## Rutas disponibles

Método | Ruta | Descripción
GET | /api/health | Estado del servidor
GET | /api/events | Lista de eventos (vacía por ahora)
POST | /api/sessions/register | Registro de usuarios
POST | /api/sessions/login | Login (pendiente de implementar)

## Modelo User

Campo      | Tipo   | Detalle
first_name | String | Requerido
last_name  | String | Requerido
email      | String | Requerido, único, normalizado (trim + lowercase)
password   | String | Requerido, almacenado como hash (bcrypt)
role       | String | Por defecto 'user', valores posibles: 'user', 'organizer', 'admin'. El campo 'role' no puede ser definido por el cliente al registrarse: siempre se asigna 'user' por defecto, sin importar lo que se envíe en el body.

## Registro de usuarios - `POST /api/sessions/register`

### Body esperando (JSON)

\`\`\`json
{
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan.perez@example.com",
  "password": "minimo8caracteres"
}
\`\`\`

### Validaciones

- `first_name`, `last_name`, `email` y `password` son obligatorios.
- `email` debe tener un formato válido.
- `password` debe cumplir con la longitud mínima requerida (8 caracteres).
- El `email` se normaliza (trim + lowercase) antes de guardarse.
- Si el `email` ya está registrado, se rechaza la solicitud.
- La contraseña se almacena hasheada con `bcrypt` (helper en `utils/`).
- La respuesta nunca incluye el campo `password`, ni en texto plano ni hasheado.

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
  "message": "El email proporcionado no es válido"
}
\`\`\`

**409 Conflict** — Email ya registrado

\`\`\`json
{
  "status": "error",
  "message": "El email ya se encuentra registrado"
}
\`\`\`

### Cómo probar el endpoint

Con el servidor corriendo, enviar una petición `POST` a `http://localhost:8080/api/sessions/register` con `Content-Type: application/json`.

**Ejemplo con cURL:**

\`\`\`bash
curl -X POST http://localhost:8080/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan.perez@example.com",
    "password": "minimo8caracteres"
  }'
\`\`\`

También se puede probar con Postman, Insomnia o Thunder Client, usando el mismo body y método.

### Casos validados

1. Registro exitoso con datos válidos → `201`.
2. Campos faltantes (`first_name`, `last_name`, `email` o `password`) → `400`.
3. Email con formato inválido → `400`.
4. Email ya registrado → `409`.
5. La contraseña se guarda hasheada en MongoDB (nunca en texto plano).
6. La respuesta del endpoint no incluye el campo `password` en ningún caso.

## Arquitectura

El flujo de la lógica sigue el patrón en capas:

\`\`\`
ruta → controller → service → repository/DAO → modelo
\`\`\`

- **routes**: define el endpoint y delega al controller.
- **controllers**: maneja `req`/`res`, llama al service y formatea la respuesta.
- **services**: contiene la lógica de negocio (validaciones, normalización, verificación de duplicados).
- **repository/dao**: abstrae el acceso a datos y la interacción con Mongoose.
- **models**: define el esquema `User` con Mongoose.
- **utils**: helper de hash/verificación de contraseñas con `bcrypt`, reutilizable en otros módulos (login, etc.).

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
