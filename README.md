# TMAG Company Admin Dashboard

The Company Admin Dashboard is the React portal for company administrators and HR teams. It helps organizations manage company profiles, employees, credits, travel plans, requests, invoices, compliance reports, audit history, API keys, settings, and data exports.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- React Router 7
- TanStack Query
- Zustand
- Axios
- Framer Motion, GSAP, Recharts, Lucide React

## Local URL

`bun run dev` starts the app on port `3002`:

```text
http://localhost:3002/admin
```

Login is available at:

```text
http://localhost:3002/auth/login
```

## Setup

```bash
cd admin-dashboard
bun install
```

Create a local `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_KEY=<same-value-as-backend-APP_API_KEY>
```

Do not commit `.env` files or real secrets.

## Scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Start the development server on port `3002`. |
| `bun run build` | Run TypeScript project build and create the Vite production bundle. |
| `bun run lint` | Run ESLint. |
| `bun run preview` | Preview the production build locally. |

## Main route areas

- `/auth/login` company admin login.
- `/admin` dashboard overview.
- `/admin/company` company profile.
- `/admin/team`, `/admin/team/invite`, and `/admin/team/onboarding` team management.
- `/admin/credits`, `/admin/credits/callback`, `/admin/credits/invoices`, and invoice details.
- `/admin/plans`, `/admin/plans/create`, and `/admin/plans/:id` company travel plans.
- `/admin/requests` credit and travel request queue.
- `/admin/reports` reporting and compliance exports.
- `/admin/audit` audit log.
- `/admin/api-keys` integration key management.
- `/admin/settings` and `/admin/settings/export` settings and data export.

## Project structure

```text
admin-dashboard/
├── src/
│   ├── api/          # Axios client, API wrappers, hooks, and types
│   ├── components/   # Admin chrome, guards, marketing/shared components, and UI primitives
│   ├── context/      # Auth and mobile sidebar contexts
│   ├── layouts/      # Admin and auth layouts
│   ├── lib/          # Query client and utilities
│   ├── pages/        # Company admin route pages
│   ├── routes/       # React Router provider and routes
│   └── stores/       # Sidebar state
├── package.json
└── vite.config.ts
```

## API integration

- API base defaults to `http://localhost:8080/api`.
- Requests send `X-Api-Key: VITE_API_KEY`.
- Company admin authentication uses backend routes under `/api/v1/company-admin/auth/*`.
- Auth stores the JWT in the `company_admin_access_token` cookie.
- Non-auth `401` responses clear the cookie and redirect to `/auth/login`.

## Development workflow

1. Start `spring-server` on port `8080` with a matching `APP_API_KEY`.
2. Ensure CORS includes `http://localhost:3002`.
3. Start this app with `bun run dev`.
4. Validate changes with `bun run build` and `bun run lint`.
