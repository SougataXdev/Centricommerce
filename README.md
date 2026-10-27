# 🛍️ Centricommerce

### A scalable, service-oriented commerce platform built for modern multi-vendor e-commerce

**Centricommerce** is a full-stack commerce platform designed around a modular, service-oriented architecture. It provides separate experiences for **customers and sellers**, while a centralized API Gateway coordinates communication between frontend applications and backend services.

The platform is built as an **Nx monorepo** using **TypeScript, Next.js, React, Express, Prisma, MongoDB, Redis, Stripe, and ImageKit**, with clear boundaries between business domains.

> **Centricommerce is not just an e-commerce storefront — it is an architectural foundation for building a scalable marketplace.**

---

## ✨ Highlights

- 🏪 Multi-seller commerce architecture
- 👤 Separate customer and seller experiences
- 🔐 Dedicated authentication service
- 🚪 Centralized API Gateway
- 📦 Dedicated product/catalog service
- 🗄️ Prisma + MongoDB data layer
- ⚡ Redis-based infrastructure utilities
- 🖼️ ImageKit-powered media management
- 💳 Stripe-ready seller/payment infrastructure
- 🎟️ Seller-specific discount codes
- ⭐ Product and shop reviews
- 🧩 Nx monorepo for modular development
- 🔒 JWT and cookie-based authentication patterns
- 🛡️ Request validation and rate limiting
- 📚 Swagger API tooling
- 🧪 Jest testing infrastructure
- 🐳 Docker-ready architecture

---

# 🎯 What is Centricommerce?

Traditional e-commerce applications often start as a single application where authentication, products, sellers, customers, payments, and business logic are tightly coupled.

Centricommerce takes a different approach.

The platform separates major business responsibilities into independently maintainable applications:

```text
                         ┌─────────────────────┐
                         │   Customer Web App   │
                         │      Next.js         │
                         └──────────┬──────────┘
                                    │
                                    │
                         ┌──────────▼──────────┐
                         │                     │
                         │    API Gateway      │
                         │     Express         │
                         │                     │
                         └──────┬───────┬──────┘
                                │       │
                    ┌───────────┘       └────────────┐
                    │                                │
             ┌──────▼──────┐                 ┌──────▼──────┐
             │ Auth Service │                 │   Product    │
             │   Express    │                 │   Service    │
             └──────┬──────┘                 └──────┬──────┘
                    │                                │
                    └────────────┬───────────────────┘
                                 │
                         ┌───────▼────────┐
                         │    MongoDB     │
                         │    + Prisma    │
                         └────────────────┘

                         ┌─────────────────────┐
                         │    Seller Portal    │
                         │       Next.js       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                              API Gateway
```

The architecture allows individual domains to evolve without turning the entire platform into a tightly coupled monolith.

---

# 🧠 Product Vision

Centricommerce is designed as a foundation for a marketplace where:

### Customers can

- Discover products
- Browse categories
- View product details
- Explore seller shops
- View product media
- Submit reviews
- Discover products from different sellers

### Sellers can

- Create and manage their shop
- Configure shop information
- Publish products
- Manage product media
- Configure pricing
- Create discount codes
- Manage product inventory information
- Build their own storefront identity

### The platform provides

- Centralized API routing
- Authentication
- Product management
- Seller management
- Shared infrastructure
- Media management
- Caching infrastructure
- Validation
- Rate limiting
- Payment integration foundations

---

# 🏗️ Architecture

Centricommerce follows a **service-oriented architecture inside an Nx monorepo**.

Instead of having one backend responsible for everything, responsibilities are divided according to business domains.

## High-Level Architecture

```text
                         INTERNET
                             │
              ┌──────────────┴──────────────┐
              │                             │
       Customer Frontend              Seller Frontend
          Next.js                       Next.js
              │                             │
              └──────────────┬──────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   API Gateway   │
                    │    Express      │
                    └───────┬─────────┘
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
       Auth Service   Product Service   Future Services
          Express         Express
             │              │
             └───────┬──────┘
                     │
                     ▼
              ┌──────────────┐
              │   Prisma     │
              │   MongoDB    │
              └──────────────┘
                     
              ┌──────────────┐
              │    Redis     │
              │ Cache / Jobs │
              └──────────────┘
```

---

# 🧩 Application Architecture

The repository currently contains the following applications:

```text
apps/
│
├── api-gateway/
│
├── api-gateway-e2e/
│
├── auth-service/
│
├── auth-service-e2e/
│
├── product-service/
│
├── seller-frontend/
│
└── user-frontend/
```

## 🚪 API Gateway

The API Gateway acts as the main entry point for external client requests.

Responsibilities include:

- Request routing
- Service proxying
- CORS handling
- Rate limiting
- Centralized access patterns
- Communication with internal services

Instead of exposing every backend service directly to the internet:

```text
Client
  │
  ▼
API Gateway
  │
  ├── /auth    → Auth Service
  │
  └── /products → Product Service
```

This provides a cleaner public API surface and creates a natural boundary for future infrastructure such as authentication middleware, observability, request tracing, and load balancing.

---

# 🔐 Authentication Service

The authentication service owns account-related functionality.

It supports authentication for:

- Customers
- Sellers

The service uses:

- Express
- TypeScript
- JWT
- Cookies
- bcrypt
- Environment-based configuration

Authentication is deliberately separated from product functionality so identity-related logic does not become coupled to the catalog domain.

---

# 📦 Product Service

The Product Service owns the product/catalog domain.

Its responsibilities include:

- Product creation
- Product publishing
- Product metadata
- Pricing
- Categories
- Subcategories
- Product media
- Stock information
- Product ratings
- Product sales information
- Product status
- Discount-code associations
- Background workflows

Products are associated with sellers and shops, allowing the platform to support a multi-seller model.

---

# 🏪 Seller Experience

The seller frontend provides a dedicated environment for merchants.

A seller can manage:

```text
Seller
  │
  └── Shop
       │
       ├── Shop Profile
       ├── Images
       ├── Products
       ├── Reviews
       ├── Discounts
       └── Store Configuration
```

This separation makes it possible to evolve the seller dashboard independently from the customer-facing storefront.

---

# 🛒 Customer Experience

The customer-facing application is built with Next.js and React.

The customer experience is centered around:

```text
Discover
   ↓
Browse Categories
   ↓
View Product
   ↓
Explore Seller
   ↓
Review / Compare
   ↓
Purchase
```

The architecture is intentionally designed so checkout, order management, inventory, recommendations, and additional commerce workflows can be introduced without restructuring the entire platform.

---

# 🗄️ Data Architecture

Centricommerce uses:

**MongoDB + Prisma**

The Prisma schema defines the core marketplace domain.

Current domain models include:

```text
Users
 │
 ├── Images
 ├── Reviews
 └── Following

Sellers
 │
 └── Shop
      │
      ├── Images
      ├── Products
      └── Reviews

Products
 │
 ├── Images
 ├── Pricing
 ├── Stock
 ├── Categories
 ├── Discounts
 └── Reviews

DiscountCodes
 │
 └── Seller

SiteConfig
```

The current schema includes models for users, sellers, shops, products, images, shop reviews, discount codes, and site configuration.

---

# 📊 Product Data Model

A product contains information such as:

```text
Product
├── title
├── description
├── slug
├── brand
├── category
├── subcategory
├── tags
├── regular price
├── sale price
├── stock
├── images
├── primary image
├── video
├── sizes
├── colors
├── custom specifications
├── discount codes
├── rating
├── total reviews
├── total sales
├── status
├── seller
└── shop
```

The schema also maintains indexes for frequently queried fields such as seller and category.

---

# 🏪 Marketplace Data Model

The relationship between sellers, shops and products is central to Centricommerce.

```text
             Seller
               │
               │ 1 : 1
               ▼
             Shop
               │
               │ 1 : N
               ▼
           Products
               │
        ┌──────┴──────┐
        ▼             ▼
    Reviews       Discounts
```

This enables the platform to support multiple independent sellers while maintaining a consistent customer experience.

---

# 🖼️ Media Architecture

Media handling is abstracted through a shared ImageKit library.

The platform supports media for:

- User avatars
- User galleries
- Shop avatars
- Shop galleries
- Product images
- Product media

This avoids embedding storage-specific logic throughout the application code.

---

# ⚡ Redis Infrastructure

Redis is available through a shared library so different services can reuse caching and infrastructure utilities.

Potential use cases include:

- API caching
- Session-related data
- Rate limiting
- Background jobs
- Temporary state
- Frequently accessed catalog data

The abstraction allows Redis-dependent infrastructure to remain reusable across services.

---

# 💳 Payments

Stripe is included in the platform dependencies and the seller model contains Stripe identity information.

This provides the foundation for future payment and marketplace workflows such as:

```text
Customer
   │
   ▼
Checkout
   │
   ▼
Payment Provider
   │
   ▼
Order
   │
   ▼
Seller Fulfillment
```

Full checkout and order-management workflows remain part of the platform roadmap.

---

# 🎟️ Discount System

Centricommerce supports seller-specific discount codes.

A discount code can contain:

- Public name
- Code
- Discount type
- Discount value
- Seller
- Usage limit
- Usage count
- Start date
- End date
- Active/inactive status

Codes are uniquely constrained per seller, allowing different sellers to use their own promotion codes without namespace collisions.

---

# ⭐ Reviews & Ratings

The platform supports shop reviews with:

- Customer
- Shop
- Rating
- Review text
- Creation timestamp
- Update timestamp

Products and shops also maintain aggregate rating information for faster storefront access.

---

# 🧱 Monorepo Structure

Centricommerce uses **Nx** to manage the entire platform inside one repository.

```text
Centricommerce/
│
├── apps/
│   │
│   ├── api-gateway/
│   ├── api-gateway-e2e/
│   ├── auth-service/
│   ├── auth-service-e2e/
│   ├── product-service/
│   ├── seller-frontend/
│   └── user-frontend/
│
├── libs/
│   │
│   ├── imagekit/
│   ├── middlewares/
│   ├── prisma/
│   └── redis/
│
├── prisma/
│   └── schema.prisma
│
├── nx.json
├── package.json
├── tsconfig.base.json
├── jest.config.ts
└── README.md
```

The current repository contains separate frontend/backend applications and shared libraries for Prisma, Redis, ImageKit, middleware and error handling.

---

# 🧰 Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| Next.js | Web applications |
| React | UI |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Headless UI | Accessible UI primitives |
| Heroicons | UI icons |
| Framer Motion | Animations |
| React Hook Form | Form management |
| TanStack React Query | Server state |

## Backend

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express | HTTP services |
| TypeScript | Type safety |
| Prisma | Database ORM |
| MongoDB | Primary database |
| Redis | Caching/infrastructure |
| JWT | Authentication |
| bcrypt | Password hashing |
| Zod | Validation |
| Axios | HTTP communication |

## Infrastructure & Integrations

| Technology | Purpose |
|---|---|
| Nx | Monorepo management |
| ImageKit | Media management |
| Stripe | Payments |
| Nodemailer | Email |
| Swagger | API documentation |
| Jest | Testing |
| Docker | Containerization |
| Node Cron | Scheduled jobs |

The current `package.json` confirms the major framework, database, infrastructure, authentication, payment, media, API documentation, and testing dependencies.

---

# 🔒 Security Architecture

Security is treated as a cross-cutting concern rather than being implemented independently inside every service.

Current building blocks include:

### Authentication

```text
Password
   ↓
bcrypt
   ↓
JWT
   ↓
HTTP Cookie
```

### API protection

- CORS
- Rate limiting
- Authentication middleware
- Request validation
- Centralized error handling

### Input validation

Zod is used as the validation layer for strongly typed request data.

This provides a consistent boundary between untrusted client input and application logic.

---

# 🚦 Service Ports

| Application | Port |
|---|---:|
| API Gateway | `8080` |
| Auth Service | `6001` |
| Product Service | `6002` |
| User Frontend | `3000` |
| Seller Frontend | `3001` |

These are the default development ports currently documented by the project.

---

# 🚀 Getting Started

## Prerequisites

Install:

- Node.js 20+
- npm
- Git
- MongoDB / MongoDB Atlas
- Redis

---

## 1. Clone the repository

```bash
git clone https://github.com/SougataXdev/Centricommerce.git

cd Centricommerce
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Create the required environment files for the services.

Example:

```env
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/centricommerce"
```

Gateway:

```env
PORT=8080
SERVICE_URL="http://localhost:6001"
PRODUCT_SERVICE_URL="http://localhost:6002"
```

Auth Service:

```env
HOST="localhost"
PORT=6001
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/centricommerce"
```

Product Service:

```env
HOST="localhost"
PORT=6002
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/centricommerce"
```

> Never commit real credentials, database URLs, API keys, JWT secrets, or payment secrets.

---

# 🗄️ Database Setup

Generate Prisma Client:

```bash
npx prisma generate
```

Push the schema to MongoDB:

```bash
npx prisma db push
```

The source schema is located at:

```text
prisma/schema.prisma
```

The repository currently uses Prisma's MongoDB provider.

---

# ▶️ Running the Platform

Run the complete workspace:

```bash
npm run dev
```

Or run individual applications.

### Customer frontend

```bash
npx nx serve user-frontend
```

### Seller frontend

```bash
npx nx serve seller-frontend
```

### API Gateway

```bash
npx nx serve api-gateway
```

### Authentication service

```bash
npx nx serve auth-service
```

### Product service

```bash
npx nx serve product-service
```

The root development script uses Nx to serve the workspace applications.

---

# 🔄 Example Request Flow

A typical customer request can flow through the system like this:

```text
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ GET /api/products
       ▼
┌─────────────────┐
│   API Gateway   │
│     :8080       │
└────────┬────────┘
         │
         │ Proxy
         ▼
┌─────────────────┐
│ Product Service │
│     :6002       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Prisma      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     MongoDB     │
└─────────────────┘
```

The response then travels back through the same service boundary:

```text
MongoDB
   ↓
Prisma
   ↓
Product Service
   ↓
API Gateway
   ↓
Browser
```

This keeps external clients decoupled from the internal service topology.

---

# 🧠 Why an API Gateway?

Without a gateway:

```text
Frontend
 ├── Auth Service
 ├── Product Service
 ├── Order Service
 ├── Payment Service
 └── User Service
```

This forces the frontend to understand the internal infrastructure.

With a gateway:

```text
                 ┌── Auth
                 │
Frontend → Gateway ── Product
                 │
                 ├── Orders
                 │
                 └── Payments
```

The frontend only needs to know about one public API boundary.

This also creates a natural location for:

- Authentication
- Authorization
- Rate limiting
- CORS
- Request logging
- API versioning
- Observability
- Service discovery
- Future load balancing

---

# 🧩 Why Nx?

Nx provides the foundation for managing multiple applications and shared libraries without splitting the codebase into completely independent repositories.

This gives Centricommerce:

### Shared code

Common middleware, database utilities, Redis helpers and integrations can be reused.

### Independent applications

Each service can have its own:

- Entry point
- Routes
- Environment
- Business logic
- Build configuration

### Developer experience

Developers can run individual services while still maintaining a single repository.

### Scalability

As the platform grows, additional services can be introduced without restructuring the entire codebase.

---

# 📈 Scalability Strategy

Centricommerce is designed so that new domains can be added independently.

Current:

```text
API Gateway
   │
   ├── Auth Service
   └── Product Service
```

Future:

```text
API Gateway
   │
   ├── Auth Service
   ├── Product Service
   ├── Order Service
   ├── Payment Service
   ├── Inventory Service
   ├── Notification Service
   ├── Search Service
   └── Recommendation Service
```

This makes the architecture suitable for evolving from an e-commerce application into a larger marketplace platform.

---

# 🛣️ Roadmap

## Commerce

- [ ] Shopping cart
- [ ] Checkout
- [ ] Order management
- [ ] Order tracking
- [ ] Inventory management
- [ ] Wishlist
- [ ] Product comparison

## Marketplace

- [ ] Multi-vendor onboarding
- [ ] Seller verification
- [ ] Seller analytics
- [ ] Seller payouts
- [ ] Commission management

## Payments

- [ ] Complete Stripe checkout
- [ ] Payment webhooks
- [ ] Refunds
- [ ] Seller payouts

## Infrastructure

- [ ] RabbitMQ/event-driven workflows
- [ ] Service-to-service event bus
- [ ] Distributed tracing
- [ ] Centralized logging
- [ ] Metrics and monitoring
- [ ] CI/CD
- [ ] Production Docker deployment
- [ ] Kubernetes deployment

## Search & Intelligence

- [ ] Full-text product search
- [ ] Elasticsearch/OpenSearch
- [ ] Personalized recommendations
- [ ] Recently viewed products
- [ ] Related products

## Platform

- [ ] Admin dashboard
- [ ] Role-based access control
- [ ] API versioning
- [ ] Advanced analytics
- [ ] Feature flags

---

# 🧪 Testing

The repository includes Jest and Nx testing infrastructure, with dedicated E2E applications for the API Gateway and authentication service.

```text
apps/
├── api-gateway-e2e/
└── auth-service-e2e/
```

This provides a foundation for expanding coverage across:

- Unit tests
- Integration tests
- API tests
- End-to-end workflows

---

# 📚 Engineering Principles

Centricommerce follows several architectural principles:

### 1. Separation of concerns

Each service owns a specific business responsibility.

### 2. Reusable infrastructure

Shared functionality lives inside libraries instead of being duplicated.

### 3. Strong typing

TypeScript is used across frontend and backend applications.

### 4. Centralized API access

The API Gateway creates a consistent external interface.

### 5. Domain-oriented growth

New capabilities should be added as isolated domains instead of increasing coupling.

### 6. Security by design

Authentication, validation, rate limiting and middleware are treated as platform-level concerns.

### 7. Incremental scalability

The platform can start with a small number of services and expand as business requirements grow.

---

# 🗂️ Repository Navigation

If you are exploring the codebase for the first time, start here:

```text
apps/api-gateway
```

Understand how external requests enter the platform.

```text
apps/auth-service
```

Understand authentication and identity management.

```text
apps/product-service
```

Understand the product/catalog domain.

```text
apps/user-frontend
```

Explore the customer-facing application.

```text
apps/seller-frontend
```

Explore the seller experience.

```text
libs/
```

Explore shared infrastructure and reusable modules.

```text
prisma/schema.prisma
```

Understand the marketplace's core data model.

---

# 💡 Key Engineering Challenges

Building Centricommerce around service boundaries introduces several interesting engineering problems:

### Service communication

Services must communicate without creating tight dependencies.

### Authentication across applications

Customer and seller applications need secure identity propagation through the gateway.

### Shared database models

Multiple services need access to consistent domain data while preserving service boundaries.

### Media management

Product and shop media need to be handled independently from business logic.

### Catalog scalability

Product queries, filtering, category browsing and search need to remain performant as the catalog grows.

### Marketplace complexity

Multiple sellers introduce additional requirements around ownership, discounts, payments, reviews and eventually inventory and payouts.

These challenges make Centricommerce more representative of a production-oriented backend system than a conventional CRUD e-commerce project.

---

# 🚀 Future Architecture

The long-term architecture can evolve toward an event-driven marketplace:

```text
                         API Gateway
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
        Auth Service     Product Service    Order Service
             │                │                │
             └────────────────┼────────────────┘
                              │
                         Event Bus
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
     Notification        Inventory            Payment
       Service             Service             Service
```

Events such as:

```text
USER_CREATED
PRODUCT_CREATED
PRODUCT_UPDATED
ORDER_CREATED
PAYMENT_COMPLETED
ORDER_CANCELLED
INVENTORY_UPDATED
```

can eventually allow services to react asynchronously instead of depending entirely on synchronous HTTP communication.

---

# 📌 Project Status

Centricommerce is an actively evolving engineering project focused on exploring:

- Service-oriented architecture
- Monorepo architecture
- Multi-vendor commerce
- Backend scalability
- Distributed systems concepts
- API Gateway patterns
- Database modeling
- Authentication
- Caching
- Payment infrastructure
- Media management

The current implementation provides the core platform and catalog foundation, while advanced commerce workflows such as complete checkout, orders, inventory and marketplace payouts remain part of the roadmap.

---

# 👨‍💻 Author

**Sougata Mandal**

Software Engineer & Full-Stack Developer

- GitHub: [@SougataXdev](https://github.com/SougataXdev)

---

# 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

### 🛍️ Centricommerce

**Building the foundation for scalable digital commerce.**

⭐ Star the repository if you find the architecture interesting.

</div>
