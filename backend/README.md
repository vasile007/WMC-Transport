QuikMove Backend (Node.js + Express + Sequelize)

Overview
- Auth (JWT): POST /api/register, POST /api/login
- Orders: POST /api/orders, GET /api/orders, PATCH /api/orders/:id
- Payments: POST /api/payments, POST /api/payments/webhook
- Tracking: Socket.IO real-time `location:update` and `tracking:subscribe`
 - Docs: Swagger UI at `/docs`, OpenAPI spec at `/openapi.yaml`

Quick Start
1) Copy `.env.example` to `.env` and adjust values.
2) Install dependencies:
   - npm install
3) Start dev server:
   - npm run dev
4) Health check: GET http://localhost:3000/health

API Docs
- OpenAPI spec: GET http://localhost:3000/openapi.yaml
- Swagger UI:   GET http://localhost:3000/docs

Postman
- Collection: `postman/QuikMove.postman_collection.json`
- Environment: `postman/QuikMove.postman_environment.json`
- Generate (requires dev deps installed):
  - npm install
  - npm run postman:gen
  - This regenerates the collection from `openapi.yaml`.

Database
- Default uses SQLite at `data/quikmove.sqlite`.
- To use Postgres/MySQL, set DB_* in `.env` accordingly.

Auth
- Register: POST /api/register { name, email, password, role? }
- Login: POST /api/login { email, password }
- Use `Authorization: Bearer <token>` for protected routes.

Orders
- Create: POST /api/orders { pickupAddress, dropoffAddress, price? }
- List: GET /api/orders?status=created|assigned|...
  - client: own orders
  - driver: assigned orders
  - admin: all orders
- Update: PATCH /api/orders/:id
  - client: can cancel own `created` orders
  - driver: can set status among assigned|in_progress|completed on own orders
  - admin: can set `status` and `driverId`

Payments
- Create: POST /api/payments { orderId, provider: mock|stripe|paypal }
  - returns Payment record and `clientSecret` (when available)
- Confirm (Stripe): POST /api/payments/confirm/stripe { orderId, paymentIntentId }
  - Verifies the PaymentIntent on the server and marks the order paid
- Webhook: POST /api/payments/webhook { providerPaymentId, status }
  - Updates `payment.status` and `order.paymentStatus` (paid/failed)
  - Add signature verification for production (Stripe/PayPal)
 - Stripe webhook (verified): POST /api/webhook/stripe
   - Configure Stripe to call this endpoint in production

Tracking (Socket.IO)
- Connect with auth token (via `auth: { token }` or `Authorization` header)
- Join rooms:
  - `tracking:subscribe` { orderId, driverId }
- Send location:
  - `location:update` { orderId, driverId, lat, lng }
- Receive broadcasts on rooms `order:<id>` and `driver:<id>`

Scripts
- `npm run db:sync` — sync database schema

Notes
- This MVP includes a mock payment provider; plug in Stripe/PayPal creds to enable real processing.

Stripe CLI (local webhook forwarding)
- Install Stripe CLI and login
- Run: `stripe listen --forward-to http://localhost:3000/api/webhook/stripe`
- In your `.env`, set `STRIPE_WEBHOOK_SECRET` to the signing secret printed by the CLI
