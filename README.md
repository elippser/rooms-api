# Elippser API - Gestión de Habitaciones PMS

Backend inicial basado en Node.js, Express y TypeScript.

## Requisitos

- Node.js 18+
- MongoDB local o remoto

## Instalación

```bash
npm install
```

## Configuración

1. Copia `.env.example` a `.env`
2. Configura `DATABASE_MDB` con la URI de tu MongoDB

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Desarrollo con hot-reload |
| `npm run build` | Compila TypeScript → `dist/` |
| `npm start` | Ejecuta en producción |
| `npm test` | Ejecuta tests |

## Estructura

```
src/
├── config/         # Configuración (DB)
├── constants/      # Constantes de la app
├── controllers/    # Controladores HTTP
├── middleware/     # Auth JWT, roles
├── models/         # Modelos Mongoose
├── routes/         # Rutas y enrutadores
├── services/       # Lógica de negocio
├── types/          # Tipos TypeScript
├── utils/          # Logger, catchAsync
├── validations/    # Schemas Joi
├── index.ts        # Punto de entrada
└── server.ts       # Configuración Express
```

## Rutas iniciales

- `GET /health` - Health check
- `GET /api/v1/rooms` - Listar habitaciones
- `GET /api/v1/rooms/:id` - Obtener habitación
- `POST /api/v1/rooms` - Crear (requiere JWT)
- `PATCH /api/v1/rooms/:id` - Actualizar (requiere JWT)
- `DELETE /api/v1/rooms/:id` - Eliminar (requiere JWT, admin)
