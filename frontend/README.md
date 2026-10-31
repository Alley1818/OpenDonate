# OpenDonate — frontend

React 18 + Vite + React Router + lucide-react. The app runs **entirely without a backend**:
by default every request goes to a simulated backend stored in `localStorage`.

## Run

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
```

Demo account (mock mode): `demo` / `demo12345` — or press "Войти как демо-пользователь" on `/login`.

## Mock mode vs real backend

| Variable | Default | Meaning |
|---|---|---|
| `VITE_USE_MOCKS` | `true` | `true` → `src/mocks/*`; `false` → `src/api/real/*` |
| `VITE_API_URL` | `http://localhost:8000` | Base URL for the real backend |

Copy `.env.example` to `.env` to change them.

## Structure

```
src/
├── api/          config, fetch client, mappers (backend → UI shape), real/ services, index.js (mock/real switch)
├── mocks/        data.js (seed), db.js (localStorage), services.js (simulated backend, same interface as real/)
├── hooks/        useAuth, useToast, useAsync, useRequireAuth, usePreferences
├── layout/       AppLayout (sidebar / right column / mobile nav), AuthLayout, ProtectedRoute, Brand
├── components/   PostCard, PostForm, ComposerModal, SubscribeModal, TierCard, CreatorCard, Modal, Field, Tabs, States, ...
├── pages/        Home, Explore, Creator, Subscriptions, Saved, CreatePost, PostDetails, Settings, Login, Register, NotFound
├── styles/       tokens (light/dark), base, layout, components, pages
└── utils/        formatting helpers
```

UI code only imports from `src/api/index.js` — never from `src/mocks`.

## Connecting the real backend

1. Set `VITE_USE_MOCKS=false`.
2. Implement the service methods in `src/api/real/index.js` (currently wired: `GET/POST /posts`, `POST /users/register`, `POST /users/login`; everything else rejects with a "not supported" error, which the UI shows as a toast / error state).
3. Adjust `src/api/mappers.js` to the backend response shapes. Cookie auth is already enabled (`credentials: "include"`); use the same hostname (`localhost` or `127.0.0.1`) for the frontend and the API.

## Simulated (needs a real backend later)

Auth and sessions, posts/likes/bookmarks/comments, creator catalog and profiles, subscription tiers and "payments", profile editing. Appearance and notification toggles are intentionally client-only (`localStorage`).
