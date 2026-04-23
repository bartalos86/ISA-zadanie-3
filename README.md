# ISA zadanie 3 - Book Recommendation System

Full-stack project for exploring books and generating recommendations based on user history (or cold-start selection).

## Project Structure

- `backend/` - Flask API, PostgreSQL access, recommendation model loading, dataset import script.
- `frontend/` - React Router + React + MUI client application.
- `docker-compose.yml` - PostgreSQL + backend containers, plus a frontend placeholder container.

## Features

- Browse and search books.
- Browse/search users.
- User-personalized recommendations (`/api/recommend/<user_id>`).
- Cold-start recommendations by selecting exactly 5 books (`/api/recommend/cold-start`).
- Book detail page with recent reviews.
- Dataset loader for importing Amazon Books `.jsonl.gz` data into PostgreSQL.

## Tech Stack

- Backend: Python, Flask, SQLAlchemy, PyTorch, PostgreSQL
- Frontend: React Router 7, React 19, TypeScript, MUI, Vite
- Infrastructure: Docker Compose

## Prerequisites

- Docker + Docker Compose
- Node.js 22+ and npm (for local frontend development)
- Python 3.12+ (if running backend tools locally, e.g. data import script)

## Quick Start (Docker DB + Backend)

From the repository root:

```bash
docker compose up --build
```

This starts:

- PostgreSQL on `localhost:5432`
- Backend API on `localhost:5001`
- Frontend placeholder container on `localhost:3000` (does not run the React app)

## Run Frontend Locally

The actual frontend is currently intended to run locally (not from Compose):

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server default URL:

- `http://localhost:5173`

The Vite proxy forwards `/api/*` requests to `http://localhost:5001`.

## Database and Data Import

The backend expects PostgreSQL with default connection:

- `postgresql+psycopg2://isa_user:isa_password@localhost:5432/isa_db`

To load data, use:

```bash
cd backend
python load_books_to_postgres.py \
  --dataset-path data/Books.jsonl.gz \
  --metadata-path data/meta_Books.jsonl.gz \
  --database-url postgresql+psycopg2://isa_user:isa_password@localhost:5432/isa_db
```

Useful optional flags:

- `--truncate` - clear existing rows before inserting
- `--max-size N` - limit number of review rows read (`0` = all)
- `--meta-max-size N` - limit metadata scan (`0` = all)
- `--min-reviews-per-user N` - default `5`
- `--min-reviews-per-book N` - default `5`
- `--chunk-size N` - insertion batch size (default `2000`)

## Recommendation Model

Backend loads a PyTorch checkpoint from:

1. `RECOMMENDER_CHECKPOINT_PATH` (if set), otherwise
2. first `.pt` / `.pth` / `.ckpt` file in `RECOMMENDER_MODEL_DIR` (default `/app/model`)

In Docker Compose, `./backend/model` is mounted read-only to `/app/model`.

## API Overview

Base URL: `http://localhost:5001/api`

- `GET /users` - list users (`search`, `page`, `limit`)
- `GET /users/<user_id>/exists` - verify user existence
- `GET /users/<user_id>/books` - latest reviewed books for user
- `GET /recommend/<user_id>` - personalized recommendations
- `POST /recommend/cold-start` - recommendations from selected ASINs (exactly 5)
- `GET /books` - list/search books (`search`, `page`, `limit`)
- `GET /books/popular` - popular books (`limit`)
- `GET /books/<asin>` - single book detail
- `GET /books/<asin>/reviews` - latest book reviews (`limit`)

## Backend Local Run (Optional)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
flask --app app.py run --host=0.0.0.0 --port=5001
```

## Notes

- The Compose `frontend` service is currently a placeholder container.
- Keep model checkpoint files in `backend/model/` for containerized backend inference.
