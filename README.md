# E-Commerce Inventory Management System

Internal inventory-management dashboard for an e-commerce company. Manage products, stock, suppliers, categories, and inventory movements.

## Why MongoDB?

- **Document model** — products are stored as documents with all their data in one place.
- **Nested data** — supplier address (`{ street, city, state, zip }`) is embedded in the supplier document.
- **Flexible product attributes** — a smartphone stores `{ screenSize, ram, storage, battery }` while a shoe stores `{ sizes, material, gender }` in the same `attributes` JSON field. No schema migration needed when a new product type arrives.
- **Arrays** — `tags`, `images`, and attribute values like `sizes: [7, 8, 9, 10]` are native arrays.
- **Aggregation** — dashboard KPIs, products-per-category, and inventory-value-per-category are computed with database-side grouping.
- **Evolving schemas** — new attribute keys can be added per product without touching the Prisma schema.

## Technology Stack

- Next.js 16.x (App Router) · React 19 · TypeScript (strict)
- Tailwind CSS 4.x · shadcn/ui (customized) · Lucide icons · IBM Plex Sans
- Prisma ORM 6.19.3 · MongoDB 8.x (Docker) · Zod validation
- Bun (package manager) · next-themes · Sonner toasts

## Prerequisites

- Bun (current stable)
- Docker + Docker Compose (for MongoDB)

No local MongoDB install needed — Docker provides it.

## Installation

```bash
git clone https://github.com/L-Tarun-Aditya/inventory-mgt-system.git
cd inventory-mgt-system

bun install

docker compose up -d

bun run db:push
bun run db:seed

bun run dev
```

Open http://localhost:3000 — the root route is the dashboard (no landing page).

## How to Install on Windows

All commands below run in **PowerShell**. Install [Git for Windows](https://git-scm.com/download/win) first if you don't have it.

### 1. Install Bun

```powershell
irm bun.sh/install.ps1 | iex
```

Close and reopen PowerShell, then verify:

```powershell
bun --version
```

### 2. Install Docker Desktop

1. Download and install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/).
2. During setup, keep **WSL 2** enabled when asked.
3. Start Docker Desktop and wait until it shows **Engine running** (bottom-left status).
4. Verify in PowerShell:

```powershell
docker --version
docker compose version
```

### 3. Clone and set up the project

```powershell
git clone https://github.com/L-Tarun-Aditya/inventory-mgt-system.git
cd inventory-mgt-system

copy .env.example .env

bun install

docker compose up -d

bun run db:push
bun run db:seed

bun run dev
```

Open http://localhost:3000.

### Windows troubleshooting

- **Docker Engine not running** — open Docker Desktop and wait for "Engine running" before `docker compose up -d`.
- **`docker compose up` fails on port 27017** — another MongoDB is already using the port. Stop it, or change the port mapping in `docker-compose.yml`.
- **Prisma `P2031` error (replica set required)** — re-run `bun run db:push` and `bun run db:seed`; if it persists, restart the container with `docker compose restart`.
- **Line-ending warnings from Git** (`LF will be replaced by CRLF`) — harmless, ignore them.
- **Bun command not found after install** — close and reopen PowerShell so `PATH` updates.

## Environment Variables

Copy the example file:

```bash
cp .env.example .env
```

`.env.example`:

```env
DATABASE_URL="mongodb://localhost:27017/inventory_management"
```

Never commit `.env` (already in `.gitignore`).

## Database

Start / stop MongoDB:

```bash
docker compose up -d
docker compose down
```

MongoDB 8.0 runs on `localhost:27017` with a persistent `mongo-data` volume. Prisma ReplicaSet note: the seed script uses operations that require a replica set; the provided single-node container works for `db push`/`db seed` in this project. If Prisma reports `P2031` (transactions require a replica set), start the container with `--replSet` or use `docker compose` as documented and re-run.

## Seeding

```bash
bun run db:seed
```

Seeds 7 categories, 6 suppliers, 26 products (each product type has different attributes), and ~39 inventory transactions. The script clears existing data first, so it can be re-run to reset.

## Useful Prisma Commands

```bash
bun run db:push     # push schema to MongoDB
bun run db:seed     # seed sample data
bun run db:studio   # open Prisma Studio
bunx prisma generate
```

## Other Scripts

```bash
bun run dev
bun run build
bun run start
bun run lint
```

## Features

- Dashboard: KPIs (products, units, low stock, out of stock, value), low-stock table, recent activity, inventory by category
- Products: full CRUD, search (name/SKU, debounced server-side), filter (category, supplier, stock status, price), sort (name, price, stock, dates), server-side pagination
- Product detail: two-column info/inventory layout, flexible JSON attributes, edit form, delete with confirmation, adjust-stock dialog, transaction history
- Stock: current levels + adjust dialog (STOCK_IN / STOCK_OUT / ADJUSTMENT / RETURN), negative inventory blocked, every change writes an `InventoryTransaction`
- Low stock: `stockQuantity <= reorderLevel` with suggested reorder quantity (`reorderLevel * 2 - stock`, min 0)
- Categories: CRUD via dialogs, product counts, delete blocked when products reference the category
- Suppliers: CRUD via dialogs, product counts, delete detaches products
- Analytics: products by category, value by category, 14-day stock movement, most-stocked products
- Light/dark mode with persisted theme toggle
- Loading skeletons, empty states, toasts, confirmations for destructive actions

## MongoDB Concepts Demonstrated

```text
Documents — products, categories, suppliers, and transactions are documents.

Embedded Data — product attributes live inside the product document;
supplier address is an embedded object.

Arrays — tags, images, and values such as shoe sizes are arrays.

References — products reference categories (restrict delete) and
suppliers (set-null on delete); transactions reference products (cascade).

CRUD — products, categories, suppliers, and inventory transactions are
created, read, updated, and deleted through Prisma.

Aggregation — dashboard stats and analytics group/filter in the database
(category counts, value sums, movement over time).

Indexes — unique SKU/email plus indexes on name, categoryId, supplierId,
stockQuantity, productId, createdAt, and transaction type.
```

## Project Structure

```text
app/               # routes: dashboard, products, categories, suppliers, stock, low-stock, analytics
components/ui/     # customized shadcn primitives (7px inputs/buttons, 8px cards/dialogs)
components/layout/ # sidebar + header + mobile sheet nav
components/products|catalog/
lib/               # prisma client, zod validations, server actions, queries, formatting
prisma/            # schema.prisma + seed.ts
docker-compose.yml # MongoDB 8.x for local dev
```

## Demo Walkthrough

1. **Dashboard** — live stats from MongoDB.
2. **Create** — Products → Add Product, e.g. Sony WH-1000XM6 with attributes `{ "noiseCancellation": true, "batteryLife": "30 hours" }`.
3. **Read** — search/filter for it on the products page.
4. **Update** — edit price or attributes on its detail page.
5. **Stock** — Adjust Stock; see the new row in Inventory History.
6. **Delete** — delete dialog removes product + its transactions.
7. **Analytics** — aggregation results per category.
8. **Explain MongoDB** — compare the headphone document with a shoe document: different attribute keys, same collection, no migrations.
