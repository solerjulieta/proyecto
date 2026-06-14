# Plataforma de Eventos e Inscripciones - API

## Temática

API REST para gestión de eventos y sus inscripciones

## Tecnologías

- Node.js
- Express
- dotenv
- ES Modules

## Instalación

\`\`\`bash
git clone <url-del-repo>
cd proyecto
npm install
\`\`\`

## Variables de entorno

Crear un archivo .env basado en .env.example

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
└── utils/ # Utilidades
\`\`\`

## Rutas disponibles

Método | Ruta | Descripción
GET | /api/health | Estado del servidor
GET | /api/events | Lista de eventos (vacía por ahora)
POST | /api/sessions/register | Registro (pendiente de implementar)
POST | /api/sessions/login | Login (pendiente de implementar)

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
