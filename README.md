# CodeSnap API

RESTful API for CodeSnap, a code snippet sharing platform. Built with Express, TypeScript, and Prisma.

## Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express 5
- **Language:** TypeScript
- **ORM:** Prisma 7
- **Database:** PostgreSQL 16
- **Validation:** Zod 4
- **Auth:** JWT + bcryptjs
- **Logging:** Winston
- **Docs:** Swagger / OpenAPI

## Project Structure

```
src/
├── config/
│   ├── index.ts          # Environment config (Zod-validated)
│   ├── database.ts       # Prisma client singleton
│   └── swagger.ts        # Swagger/OpenAPI spec
├── shared/
│   ├── errors/
│   │   └── AppError.ts   # Custom error hierarchy
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── validate.ts
│   └── utils/
│       ├── hash.ts       # Password hashing (bcryptjs)
│       ├── jwt.ts        # JWT sign/verify
│       └── logger.ts     # Winston logger
├── modules/
│   ├── auth/             # Register, login, me
│   ├── users/            # User profiles
│   ├── snippets/         # CRUD, search, fork, share
│   ├── tags/             # Tag listing with counts
│   └── collections/      # CRUD, add/remove snippets
├── app.ts                # Express app setup
└── server.ts             # HTTP server entry point
prisma/
├── schema.prisma         # Database schema
├── prisma.config.ts      # Prisma v7 config
└── seed.ts               # Demo seed data
```

## Prerequisites

- Node.js 20+
- PostgreSQL 16
- Docker (optional, for database)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/dief-ysis/codesnap-backend.git
cd codesnap-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start PostgreSQL (Docker)
docker-compose up -d

# Run database migrations
npx prisma migrate dev

# Seed demo data
npx prisma db seed

# Start development server
npm run dev
```

The API will be available at `http://localhost:3001`.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | Secret key for JWT signing | — |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

## API Endpoints

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/v1/health` | Health check | No |
| POST | `/api/v1/auth/register` | Register a new user | No |
| POST | `/api/v1/auth/login` | Login and get JWT | No |
| GET | `/api/v1/auth/me` | Get current user | Yes |
| GET | `/api/v1/users/:id` | Get user profile | No |
| PUT | `/api/v1/users/:id` | Update user profile | Yes |
| POST | `/api/v1/snippets` | Create a snippet | Yes |
| GET | `/api/v1/snippets` | List user snippets | Yes |
| GET | `/api/v1/snippets/public` | List public snippets | No |
| GET | `/api/v1/snippets/search` | Search snippets (full-text) | No |
| GET | `/api/v1/snippets/share/:slug` | Get snippet by share slug | No |
| GET | `/api/v1/snippets/:id` | Get snippet by ID | Mixed |
| PUT | `/api/v1/snippets/:id` | Update a snippet | Yes |
| DELETE | `/api/v1/snippets/:id` | Delete a snippet | Yes |
| POST | `/api/v1/snippets/:id/fork` | Fork a snippet | Yes |
| GET | `/api/v1/tags` | List all tags with counts | No |
| POST | `/api/v1/collections` | Create a collection | Yes |
| GET | `/api/v1/collections` | List user collections | Yes |
| GET | `/api/v1/collections/:id` | Get collection with snippets | Yes |
| PUT | `/api/v1/collections/:id` | Update a collection | Yes |
| DELETE | `/api/v1/collections/:id` | Delete a collection | Yes |
| POST | `/api/v1/collections/:id/snippets` | Add snippet to collection | Yes |
| DELETE | `/api/v1/collections/:id/snippets/:snippetId` | Remove snippet from collection | Yes |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npx prisma migrate dev` | Run database migrations |
| `npx prisma db seed` | Seed the database |

## API Documentation

Interactive Swagger UI is available at `/api-docs` when the server is running.

## Database Schema

The database includes the following models:

- **User** — Authentication and profile data
- **Snippet** — Code snippets with language, visibility, and optional forking lineage
- **Tag** — Labels for organizing snippets (many-to-many via SnippetTag)
- **Collection** — User-created groups of snippets (many-to-many via CollectionSnippet)
