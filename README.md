# Plataforma de Eventos e Inscripciones — API

API REST para gestión de eventos culturales (conciertos, teatro, standup, festivales) con autenticación JWT, roles y sistema de tickets con control de cupos.

## Tecnologías

Node.js · Express · MongoDB (Mongoose) · Passport.js · JWT · bcrypt · Nodemailer · cookie-parser

## Instalación y ejecución

```bash
git clone <url-del-repo>
cd proyecto
npm install
npm run dev     # desarrollo
npm start       # producción
```

Servidor en `http://localhost:8080`

## Variables de entorno

Crear `.env` basado en `.env.example`:

```
PORT=8080
MONGO_URL=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/<nombre-db>
JWT_SECRET=clave_larga_y_aleatoria
JWT_EXPIRES_IN=1h
NODE_ENV=development
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu@gmail.com
MAIL_PASS=tu_app_password
MAIL_FROM="Plataforma Eventos <tu@gmail.com>"
```

> Para Gmail usá una **App Password**: Google Account → Seguridad → Contraseñas de aplicación.

## Estructura

```
src/
├── config/         # env, db, passport
├── routes/         # endpoints
├── controllers/    # request/response
├── services/       # lógica de negocio y validaciones
├── repositories/   # abstracción de datos
├── dao/            # acceso a Mongoose (único lugar que importa modelos)
├── models/         # schemas User, Event, Reservation
├── middlewares/    # auth, authorize, isEventOwnerOrAdmin, error
├── dto/            # CurrentUserDTO, EventDTO, ReservationDTO
└── utils/          # hash.js, jwt.js, mailer.js
```

---

## Roles y permisos

| Acción | user | organizer | admin |
|---|---|---|---|
| Ver eventos publicados | ✅ | ✅ | ✅ |
| Comprar tickets | ✅ | ✅ | ✅ |
| Cancelar propios tickets | ✅ | ✅ | ✅ |
| Crear eventos | ❌ | ✅ | ✅ |
| Modificar/cancelar eventos propios | ❌ | ✅ | ✅ |
| Modificar cualquier evento | ❌ | ❌ | ✅ |
| Cancelar ticket ajeno | ❌ | ❌ | ✅ |
| Ver todos los usuarios | ❌ | ❌ | ✅ |

> El registro siempre asigna `role: 'user'`. Los roles `organizer` y `admin` se asignan manualmente en la base de datos.

**401** → sin sesión válida | **403** → con sesión pero sin permisos

---

## Endpoints

### Sesiones

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/api/sessions/register` | Registro | No |
| POST | `/api/sessions/login` | Login → cookie JWT | No |
| GET | `/api/sessions/current` | Usuario autenticado | Sí |
| POST | `/api/sessions/logout` | Cerrar sesión | No |

### Usuarios

| Método | Ruta | Descripción | Roles |
|---|---|---|---|
| GET | `/api/users` | Ver todos los usuarios | `admin` |

### Eventos

| Método | Ruta | Descripción | Roles |
|---|---|---|---|
| GET | `/api/events` | Listado con filtros y paginación | Público |
| GET | `/api/events/:id` | Detalle de evento | Público |
| POST | `/api/events` | Crear evento | `organizer`, `admin` |
| PUT | `/api/events/:id` | Modificar evento | `organizer` (propio), `admin` |
| PATCH | `/api/events/:id/status` | Cambiar estado | `organizer` (propio), `admin` |
| DELETE | `/api/events/:id` | Cancelar evento | `organizer` (propio), `admin` |

### Tickets

| Método | Ruta | Descripción | Roles |
|---|---|---|---|
| POST | `/api/events/:eid/tickets` | Comprar tickets (max 4) | Autenticado |
| GET | `/api/tickets/my-tickets` | Mis tickets | Autenticado |
| GET | `/api/events/:eid/tickets` | Tickets de un evento | `organizer` (propio), `admin` |
| PATCH | `/api/tickets/:tid/cancel` | Cancelar ticket | Dueño o `admin` |

---

## Filtros disponibles — `GET /api/events`

| Parámetro | Descripción | Ejemplo |
|---|---|---|
| `status` | Estado del evento | `?status=published` |
| `category` | Categoría | `?category=concierto` |
| `location` | Ubicación | `?location=buenos aires` |
| `dateFrom` | Desde fecha | `?dateFrom=2026-09-01` |
| `dateTo` | Hasta fecha | `?dateTo=2026-12-31` |
| `page` | Página (default: 1) | `?page=2` |
| `limit` | Por página (default: 10) | `?limit=5` |
| `sort` | Ordenar por campo | `?sort=date` |

Solo muestra eventos con fecha futura. Respuesta incluye `data`, `page`, `limit`, `total`, `totalPages`.

---

## Modelos

### User
`first_name` · `last_name` · `email` (único, normalizado) · `password` (bcrypt) · `role` (default: `'user'`)

### Event
`title` · `description` · `category` · `date` · `duration` · `location` · `capacity` · `price` · `status` (`draft/published/cancelled/finished`) · `organizer` (ref User)

Categorías: `concierto` · `teatro` · `standup` · `festival` · `workshop` · `conferencia` · `otro`

### Reservation (Ticket)
`user` (ref) · `event` (ref) · `status` (`confirmed/pending/cancelled`) · `quantity` · `reservationCode` (UUID) · `cancelledAt`

---

## Reglas de negocio principales

**Eventos:**
- No se pueden crear con fecha pasada
- `capacity > 0`, `price ≥ 0`
- Eventos cancelados no se modifican
- Eventos finalizados no se publican nuevamente
- Los eventos no se eliminan físicamente — se cancelan

**Tickets:**
- Solo se puede comprar en eventos `published` y con fecha futura
- Máximo 4 tickets por compra
- Un usuario no puede tener dos reservas activas para el mismo evento
- Cupos = `capacity − sum(quantity de tickets no cancelados)`
- Los tickets no se eliminan físicamente — se cancelan
- Al confirmar una compra se envía email automáticamente

---

## Flujo de autenticación e inscripción

```
1. POST /api/sessions/register     → crear cuenta
2. POST /api/sessions/login        → obtener cookie JWT
3. GET  /api/events?status=published → explorar eventos
4. POST /api/events/:eid/tickets   → comprar { "quantity": 2 }
5. Email de confirmación recibido automáticamente
6. GET  /api/tickets/my-tickets    → ver mis reservas
7. PATCH /api/tickets/:tid/cancel  → cancelar si es necesario
8. POST /api/sessions/logout       → cerrar sesión
```

---

## Cómo crear usuarios de prueba

1. Registrarse con `POST /api/sessions/register`
2. El rol por defecto es `user`
3. Para cambiar a `organizer` o `admin`: editar el campo `role` directamente en MongoDB Atlas

**Usuarios sugeridos para pruebas:**
```
user@test.com / 123456          → role: user
organizer@test.com / 123456     → role: organizer (cambiar en Atlas)
admin@test.com / 123456         → role: admin (cambiar en Atlas)
```

---

## Seguridad

- Contraseñas hasheadas con `bcrypt` — nunca en texto plano
- `role` y `organizer` no manipulables desde el body
- Cookie `httpOnly` — protección XSS
- JWT contiene solo `{ id, email, role }` — sin password
- Mensajes de error de login genéricos
- Credenciales de email solo en variables de entorno
- DTOs garantizan que `password` nunca aparece en respuestas