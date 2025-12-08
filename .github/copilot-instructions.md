# Copilot / AI Agent Instructions — Financial Tracker

Goal: make changes quickly in this FastAPI + SQLModel backend and Next.js frontend monorepo.

**Big picture**
- Apps: `backend/` (FastAPI + SQLModel, SQLite), `frontend/` (Next.js + React).
- Current behavior: frontend is self-contained and persists transactions to `localStorage` (see `frontend/pages/index.js`); backend is present but not required to run the UI.
- If you re-enable the API: backend serves JSON under `/api/...`; frontend would call `http://localhost:8000` in dev.
- Data: backend uses SQLite and would create tables via `SQLModel.metadata.create_all()` (check `backend/app/db.py`). No migrations assumed.

**Start locally**
- Frontend only (current flow): `cd frontend && npm install && npm run dev` → open `http://localhost:3000` (data stored in browser localStorage).
- Backend (optional/API): `python -m venv .venv`; activate; `pip install -r backend/requirements.txt`; run `uvicorn app.main:app --reload --port 8000 --app-dir backend`.

**API contract (current)**
- GET `/api/transactions` (list), POST `/api/transactions` (create).
- GET/PUT/DELETE `/api/transactions/{id}`.
- GET `/api/reports/summary`.
- Example POST body:
  ```json
  {"date":"2025-12-08","amount":12.34,"description":"Lunch","category":"Food"}
  ```

**Open these files first**
- Frontend: `frontend/pages/index.js` (localStorage CRUD + form + list), `frontend/pages/_app.js` (global CSS import), `frontend/styles/globals.css` (styling), `frontend/package.json` (scripts).
- Backend (optional/API): `backend/app/main.py` (routes/CORS), `backend/app/models.py` (SQLModel models/schemas), `backend/app/crud.py` (DB ops), `backend/app/db.py` (engine/session), `backend/requirements.txt` (versions).

**Conventions / patterns**
- Frontend currently uses browser localStorage (`financial-tracker:transactions`) and does not call the backend. Keep payload shape aligned with `Transaction` fields if you reintroduce API calls.
- If using backend: frontend expects unproxied backend at `http://localhost:8000`; keep CORS aligned with that origin.
- SQLModel models double as Pydantic schemas; align request/response shapes with models in `models.py` if API is used.
- No tests or auth yet; plan additions (JWT, validation) without breaking current flows.

**Workflows**
- Frontend-only workflow: run Next.js dev server; transactions persist in localStorage (cleared per browser/storage). No backend required.
- API workflow (optional): run backend + frontend separately; use `curl`/`http` to poke endpoints while coding.
- When changing DB schema, prefer additive changes and note any manual migration steps (SQLite, no migrations baked in).

**Useful AI tasks**
- Debug an endpoint: reproduce with `--reload`, trace route → CRUD → model, and verify schema/response.
- Improve frontend UX: add validation on forms following existing controlled components in `pages/` or `src`.
- Add reports/filters: extend `crud` and surface via new API + frontend fetch.

Next planned work: JWT auth, validation, better UI/UX, charting, CSV import/export. If you add these, document new env vars, CORS changes, and test commands.
