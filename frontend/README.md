QuikMove Frontend (React + Vite + Tailwind)

Scripts
- npm run dev — start dev server
- npm run build — production build
- npm run preview — preview production build

Env
- copy .env.example to .env and set:
  - VITE_API_URL=http://localhost:3000
  - VITE_GOOGLE_MAPS_API_KEY=...
  - VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

Structure
- src/pages — route pages (Login, Register, Client, Driver, Admin, Track, Pay)
- src/components — reusable components (Navbar, ProtectedRoute)
- src/services — api client, auth context, orders/payments services, socket

Routing
- /login, /register
- /client (client role)
- /driver (driver role)
- /admin (admin role)
- /track/:orderId (protected)
- /pay/:orderId (protected)

Backend (MySQL)
- A minimal Node/Express API is included under `server/`.
- Configure `server/.env` with your MySQL credentials (see `server/.env.example`).
- Initialize the DB using `server/sql/schema.sql` in your `quikmove` database.
- Install and run:
  - `cd server && npm install && npm run dev`
- Frontend must point to the API: set `VITE_API_URL=http://localhost:3000` in root `.env`.
