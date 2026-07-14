# CRM Open Source - Inicial

Estructura inicial del proyecto CRM modular para empresa minera/industrial.

Backend:
- Node.js + Express
- Prisma + PostgreSQL
- JWT + Bcrypt

Frontend:
- React + Vite
- Tailwind CSS (config pending)

Comandos:

Backend:

```bash
cd backend
npm install
# configurar .env
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Prisma:

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js
```
