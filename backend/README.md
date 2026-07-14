# CRM Backend

Backend Express para CRM modular.

Instalación:

```bash
cd backend
npm install
cp .env.example .env
# editar .env si es necesario (DATABASE_URL, JWT_SECRET)

# Opción A: usar Docker Compose (recomendado para Postgres local)
Desde la raíz del proyecto:

```bash
docker-compose up -d
cd backend
npm install
npm run db:setup
npm run dev
```

# Opción B: usar una base Postgres externa y ejecutar migraciones

```bash
cd backend
npm install
cp .env.example .env
# ajustar DATABASE_URL en .env
npm run db:setup
npm run dev
```
```

Endpoints:
- POST /api/auth/login
- GET /api/users
- GET /api/areas
- GET /api/meetings/rooms
- POST /api/meetings/request
- GET /api/radios
- GET /api/food/menus
- POST /api/food/menus
- POST /api/food/confirm
- GET /api/forms
- POST /api/forms
- POST /api/forms/submit
- GET /api/notifications
- POST /api/notifications
- GET /api/settings
- POST /api/settings

