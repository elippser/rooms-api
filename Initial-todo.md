---

## Responsabilidad

Este backend gestiona únicamente lo que el pms-core no cubre:
- CRUD completo de unidades (habitaciones)
- Historial de cambios de estado
- Enriquecimiento de datos de unidades con info del core

Los datos de Property, OperativeSpace y Users se leen del pms-core via HTTP. No se duplican.

---

## Variables de entorno

env
PORT=4001
MONGODB_URI=           # DB propia de esta app
JWT_SECRET=            # mismo que pms-core
CORE_API_URL=          # URL del backend de pms-core


---

## Modelo — Unit

Archivo: src/models/Unit.ts

Este modelo vive en la DB de esta app, no en el core. El core tiene su propio Unit simplificado; este es el extendido con todos los campos operativos.

typescript
interface IUnit {
  unitId: string;               // "unit-{uuid}"
  propertyId: string;           // ref a Property del core
  companyId: string;

  // Identificación
  name: string;                 // "Habitación 101", "Suite Presidencial"
  number?: string;              // "101", "202"
  floor?: string;               // "1", "PB", "Planta Alta"
  description?: string;

  // Tipo y capacidad
  type: UnitType;               // ver enum abajo
  capacity: {
    adults: number;
    children: number;
  };

  // Físico
  size?: number;                // m²
  photos: string[];             // URLs o base64

  // Estado operativo
  status: UnitStatus;           // ver enum abajo

  // Propiedades custom del hotelero
  customProperties?: Schema.Types.Mixed;

  // Auditoría
  isActive: boolean;            // soft delete
  createdAt: Date;
  updatedAt?: Date;
}

type UnitType =
  | "single"
  | "double"
  | "twin"
  | "triple"
  | "suite"
  | "presidential"
  | "cabin"
  | "apartment"
  | "dorm"
  | "custom";

type UnitStatus =
  | "available"
  | "occupied"
  | "cleaning"
  | "maintenance"
  | "blocked"
  | "checkout-pending";


*Índices:*
- unitId unique
- propertyId
- companyId
- status

---

## Modelo — UnitStateHistory

Archivo: src/models/UnitStateHistory.ts

Registra cada cambio de estado de una unidad.

typescript
interface IUnitStateHistory {
  historyId: string;            // "hist-{uuid}"
  unitId: string;
  propertyId: string;
  companyId: string;
  previousStatus: UnitStatus;
  newStatus: UnitStatus;
  changedByUserId: string;
  changedAt: Date;
  notes?: string;
}


*Índices:*
- unitId
- propertyId
- changedAt (desc)

---

## coreClient.ts

Archivo: src/services/coreClient.ts

Cliente HTTP hacia pms-core. Se usa para validar que la property existe y pertenece a la company antes de operar.

typescript
// Verificar que property existe y pertenece a company
verifyProperty(propertyId: string, companyId: string, token: string): Promise<boolean>

// Obtener datos básicos de property (nombre, tipo)
getProperty(propertyId: string, token: string): Promise<CoreProperty>


---

## Endpoints

Base: /api/v1

Auth en todos: authenticateJWT

### Units — CRUD

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| POST | /properties/:propertyId/units | owner · admin | Crear unidad |
| GET | /properties/:propertyId/units | todos | Listar unidades de una propiedad |
| GET | /properties/:propertyId/units/:unitId | todos | Detalle de una unidad |
| PATCH | /properties/:propertyId/units/:unitId | owner · admin | Editar datos de una unidad |
| PATCH | /properties/:propertyId/units/:unitId/status | owner · admin · staff | Cambiar estado |
| DELETE | /properties/:propertyId/units/:unitId | owner · admin | Soft delete |

### Historial

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| GET | /properties/:propertyId/units/:unitId/history | todos | Historial de cambios de una unidad |
| GET | /properties/:propertyId/units/states | todos | Estado actual de todas las unidades |

---

## Lógica de endpoints críticos

### POST /properties/:propertyId/units

1. Verificar property en core via coreClient.verifyProperty()
2. Generar unitId = "unit-{uuid}"
3. Crear Unit con status: "available" por defecto
4. Registrar entrada inicial en UnitStateHistory
5. Retornar unit creada

*Body:*
json
{
  "name": "Habitación 101",
  "number": "101",
  "floor": "1",
  "description": "Habitación doble con vista al mar",
  "type": "double",
  "capacity": { "adults": 2, "children": 1 },
  "size": 28,
  "photos": [],
  "customProperties": {}
}


---

### PATCH /properties/:propertyId/units/:unitId/status

1. Buscar unit por unitId y propertyId
2. Validar transición de estado (ver matriz abajo)
3. Guardar previousStatus
4. Actualizar unit.status
5. Crear entrada en UnitStateHistory
6. Retornar unit actualizada

*Matriz de transiciones válidas:*

| Desde \ Hacia | available | occupied | cleaning | maintenance | blocked | checkout-pending |
|---------------|-----------|----------|----------|-------------|---------|-----------------|
| available | - | ✓ | ✓ | ✓ | ✓ | - |
| occupied | - | - | - | - | - | ✓ |
| checkout-pending | ✓ | - | ✓ | ✓ | ✓ | - |
| cleaning | ✓ | - | - | ✓ | ✓ | - |
| maintenance | ✓ | - | ✓ | - | ✓ | - |
| blocked | ✓ | ✓ | ✓ | ✓ | - | - |

*Body:*
json
{
  "status": "cleaning",
  "notes": "Salida temprana, iniciar limpieza"
}


---

### GET /properties/:propertyId/units/states

Retorna todas las unidades activas de una propiedad con su estado actual y último cambio:

json
[
  {
    "unitId": "unit-...",
    "name": "Habitación 101",
    "number": "101",
    "floor": "1",
    "type": "double",
    "capacity": { "adults": 2, "children": 1 },
    "size": 28,
    "status": "occupied",
    "photos": [],
    "customProperties": {},
    "lastChange": {
      "previousStatus": "available",
      "changedByUserId": "user-...",
      "changedAt": "2026-03-12T10:00:00Z",
      "notes": ""
    }
  }
]


---

## Autenticación

Mismo middleware authenticateJWT que el core. Lee el JWT del header Authorization: Bearer o de la cookie app_token.

typescript
// src/middleware/authenticateJWT.ts
// Idéntico al del core — mismo JWT_SECRET


---

## Estructura de archivos


backend/
├── src/
│   ├── constants/
│   │   └── unitConstants.ts      — UnitType, UnitStatus, matriz de transiciones
│   ├── models/
│   │   ├── Unit.ts
│   │   └── UnitStateHistory.ts
│   ├── services/
│   │   ├── coreClient.ts
│   │   ├── unitService.ts
│   │   └── unitStateService.ts
│   ├── controllers/
│   │   └── unitController.ts
│   ├── routes/
│   │   └── unitRouter.ts
│   ├── middleware/
│   │   ├── authenticateJWT.ts
│   │   └── requireRole.ts
│   ├── validations/
│   │   └── unitSchemas.ts
│   └── server.ts
├── .env
└── package.json


---

## Orden de implementación


1. Setup Express + MongoDB + .env
2. src/constants/unitConstants.ts
3. Modelo Unit.ts
4. Modelo UnitStateHistory.ts
5. coreClient.ts
6. unitService.ts — CRUD completo
7. unitStateService.ts — cambio de estado + historial
8. unitController.ts
9. unitRouter.ts
10. Middleware authenticateJWT + requireRole
11. server.ts
12. Validaciones Joi