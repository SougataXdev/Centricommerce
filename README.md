# Centricommerce

<div align="center">
  <img src="https://img.shields.io/badge/Nx-21.4.1-1C1E2E?style=for-the-badge&logo=nx&logoColor=white" alt="Nx" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-6.15-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
</div>

Centricommerce is a full-stack commerce platform built as a monorepo using Nx, TypeScript, Next.js, Express, Prisma, and MongoDB. It is designed to support a modern multi-tenant e-commerce ecosystem with separate user and seller experiences, a gateway layer for routing, and backend services for authentication and product management.

This project is structured for modular growth, clean service boundaries, and the ability to scale from a small storefront into a production-ready marketplace product.

## Why this project

Centricommerce solves the common challenge of building commerce experiences with separate concerns:

- Customer-facing storefronts
- Seller dashboards and storefront management
- Authentication and session handling
- Product catalog and pricing systems
- Shared platform utilities and libraries
- Central API routing through a gateway

The repository uses an Nx workspace so applications and shared libraries can evolve independently while staying connected through a single codebase.

## Product vision

Centricommerce aims to provide a modern digital commerce foundation for:

- B2C shopping experiences
- Seller onboarding and storefront tooling
- Product browsing and media-rich listings
- Reviews and catalog management
- Marketplace-style scaling in the future

## Architecture overview

The system is organized into multiple applications and shared libraries:

### Applications

- API Gateway
  - Handles external requests
  - Routes traffic to the correct backend service
  - Centralizes request access patterns, CORS, rate limiting, and proxying

- Auth Service
  - Handles user and seller authentication
  - Serves account-related API routes
  - Uses Express and environment-based configuration

- Product Service
  - Manages products, pricing, catalog data, and background jobs
  - Runs domain-specific product workflows

- User Frontend
  - Frontend experience for customers
  - Built with Next.js and React

- Seller Frontend
  - Frontend experience for sellers and storefront management

### Shared libraries

- Prisma library
- Redis utilities
- ImageKit integrations
- Middleware and error handling utilities

## Feature set

### Customer features

- Product discovery and browsing
- Category-aware storefronts
- Product media and detail pages
- Ratings and review support
- Flexible commerce data model for future shopping flows

### Seller features

- Seller account management
- Shop setup and profile configuration
- Product publishing and catalog management
- Discount code support
- Media-driven product merchandising

### Platform features

- Monorepo architecture via Nx
- Service-based backend separation
- Prisma-first data modeling with MongoDB
- Shared code reuse across apps
- Central gateway for internal routing and scaling
- Environment-based service configuration

## Tech stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Headless UI
- Heroicons

### Backend

- Node.js
- Express
- TypeScript
- Prisma
- MongoDB

### Infra and tooling

- Nx
- Redis
- ImageKit
- JWT / cookie based auth patterns
- Nodemailer
- Stripe
- Swagger tooling
- Docker-ready project structure

## Repository structure

```bash
centricommerce/
├── apps/
│   ├── api-gateway/
│   ├── api-gateway-e2e/
│   ├── auth-service/
│   ├── auth-service-e2e/
│   ├── product-service/
│   ├── seller-frontend/
│   └── user-frontend/
├── libs/
│   ├── imagekit/
│   ├── middlewares/
│   ├── prisma/
│   └── redis/
├── prisma/
│   └── schema.prisma
├── .editorconfig
├── .gitignore
├── .prettierrc
├── jest.config.ts
├── jest.preset.js
├── nx.json
├── package.json
├── tsconfig.base.json
├── tsconfig.json
├── README.md
└── package-lock.json
```

## Getting started

### Prerequisites

Make sure you have the following installed:

- Node.js 20+
- npm
- Git
- MongoDB instance or MongoDB Atlas cluster
- Redis (if used by your local setup or future workflows)

## Installation

Clone the repository:

```bash
git clone https://github.com/SougataXdev/Centricommerce.git
cd Centricommerce
```

Install dependencies:

```bash
npm install
```

## Environment configuration

Create the required environment files and configure them for your local setup.

### Root environment example

```env
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/centricommerce"
PORT=8080
SERVICE_URL="http://localhost:6001"
PRODUCT_SERVICE_URL="http://localhost:6002"
```

### Auth service example

```env
HOST="localhost"
PORT=6001
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/centricommerce"
```

### Product service example

```env
HOST="localhost"
PORT=6002
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/centricommerce"
```

> Update the values to match your local environment or deployment setup.

## Database setup

This project uses Prisma with MongoDB.

Generate the Prisma client:

```bash
npx prisma generate
```

Push the schema to your MongoDB instance:

```bash
npx prisma db push
```

The Prisma schema lives here:

```bash
prisma/schema.prisma
```

## Running the project

### Run all services through Nx

```bash
npm run dev
```

### Run the user frontend

```bash
npx nx serve user-frontend
```

### Run the seller frontend

```bash
npx nx serve seller-frontend
```

### Run the API gateway

```bash
npx nx serve api-gateway
```

### Run the auth service

```bash
npx nx serve auth-service
```

### Run the product service

```bash
npx nx serve product-service
```

## Service ports

| Service | Default Port |
|---|---:|
| API Gateway | 8080 |
| Auth Service | 6001 |
| Product Service | 6002 |
| User Frontend | 3000 |
| Seller Frontend | 3001 |

## Core data model

The Prisma schema contains models for the marketplace domain, including:

- Users
- Sellers
- Shops
- Products
- Images
- Reviews
- Discount codes
- Site configuration

This gives the platform a strong foundation for catalog, storefront, and seller operations.

## Development notes

- The codebase is organized as a monorepo using Nx
- Shared libraries centralize reusable logic and reduce duplication
- Backend services are separated by business responsibility
- The API gateway acts as an entry point for client traffic
- Prisma is used as the source of truth for commerce-related models

## Future roadmap

Potential enhancements for this project include:

- Inventory tracking and stock management
- Payment integration and checkout flow
- Order management
- Admin dashboard
- Search and recommendation improvements
- Multi-vendor marketplace features
- Deployment automation and CI/CD pipelines

## Contributing

Contributions are welcome. If you'd like to improve the platform:

```bash
git checkout -b feature/your-feature
git add .
git commit -m "Add feature"
git push origin feature/your-feature
```

Then open a pull request on GitHub.

## License

This project is licensed under the MIT License.

## Project summary

Centricommerce is a modular commerce platform designed for modern e-commerce workflows, clean domain separation, and scalable growth. It combines a service-oriented backend, React/Next.js frontends, and a Prisma-based data layer to create a strong foundation for building a custom digital storefront ecosystem.

---

If you want to explore the repository, start with:

- `apps/api-gateway`
- `apps/auth-service`
- `apps/product-service`
- `apps/user-frontend`
- `apps/seller-frontend`
- `prisma/schema.prisma`
