# ISA zadanie 3 - Book Recommendation System

## Goal
This application was created to simulate a production bookshop, with the goal of integrating our AI model. Not all features of the page are functional, some compoanents such as footer and category bar was addded for easthetic purposes.

What is working (User manual):
1. Book recommendation by user - select a user from the dropdown or from the user bubbles, when a user is selected, their books are displayed. To see more detail and review about the books click on the cover. To get recommended similar books click on the `Get recommendations` button.
2. Book recommendation cold start - if you want ot get books recommended for you own tasste, click on the `New user? Start onboarding` button, when no user is selected. Here you will have to choose 5 books which mathc your taste. You can load more options with `load more books` button, when ready click the `Get Recommendations` button.
3. Book detail view - when you click on the cover of a random book, you get taken to the book detail view, here you can see additional information about the given book, along with the reviews. When the `user_id` of the reviewer is highlighted with white, you can click on the id and see the other books purchased by the given reviewer.
4. Search - as an extra the search bar also works and all books are fully searchable.


## Deployment
The project was deployed on a private server and a custom private-owned domain. The deployment integrates our aforementioned submission 2 AI hybrid recsys model and follows the docker compose process, as proof of applicability.

The deployed project can be found on the following web:

## https://booksense.omnit.sk/


## AI Act considerations

### System classification
Book recommender system - not a high risk according to Annex III (EU AI Act - high-risk AI systems) and it is not used in making decisions in sensitive domains

### Model quality
- `Recall@10`: 0.0694850900
- `NDCG@10`: 0.0414916329
- Based on the real-world evaluation, the recommender produces fairly accurate recommendations even for cold start. In most cases the recommended book's category and topic matches the already bought or selected books categories.

### Risk assasement
- **Popularity bias**: more popular books are more prone to being promoted
  - Mitigataion: This is mitigrated druing training using popularity resampling
- **Data quality risk**: noisy data, duplicate reviews, books, books with no reviews
  - Mitigated: Only books and users with more than 5 reviews were used for training, additionally to avoid books with the same title being diplasyed multiple times (different `asin`), FE filtering is used
- **User harm risk**: books with inappropraite content and cover ca be recommended to users
  - Mitigration: The books should be already filered as this is a dataset from Amazon, but the implementation of additional per user blacklisting or special filter would be recommended in a real-world use case
- **Technical failure risk**: the ai model can be killed by a process manager due to high RAM usage
  - Mitigration: popular books are returned from the database instead
- **Privacy risk (GDPR)**: Sensitive user data gets leaked, such as taste in books
  - Mitigation: no personal data is retained which can be used for identification, all users are fully anonymous

### Transparency and human oversight
- Users are informed that the recommendations are AI generated as this is the whole promise of the application. :D

## Project Structure

- `backend/` - Flask API, PostgreSQL access, recommendation model loading, dataset import script.
- `frontend/` - React Router + React + MUI client application.
- `database/` - Database seeding
- `docker-compose.yml` - PostgreSQL + backend containers, plus a frontend placeholder container.

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

First, you have to create a `model` folder inside `backend` and put the exported model here.
The model can be downloaded from: [Pretrained model](https://drive.google.com/file/d/1jC4SvaFWLBV4_fWf5oOpU_hkws_ON5ID/view?usp=sharing)

Then:
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

The datasets can be downloaded from the following links:
- [Dataset](https://mcauleylab.ucsd.edu/public_datasets/data/amazon_2023/raw/review_categories/Books.jsonl.gz)
- [Metadata](https://mcauleylab.ucsd.edu/public_datasets/data/amazon_2023/raw/meta_categories/meta_Books.jsonl.gz)

If you want to manually load data, use (this is necessary on first run):

```bash
cd backend
pip install -r requirements.txt
#When docker compose containers are already running
python load_books_to_postgres.py \
  --dataset-path data/Books.jsonl.gz \
  --metadata-path data/meta_Books.jsonl.gz \
  --database-url postgresql+psycopg2://isa_user:isa_password@localhost:5432/isa_db \
  --max-size 2000000
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

1. `backend/model` (Accepted file types: `.pt` / `.pth` / `.ckpt`)

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



## Gallery
<img width="1026" height="1314" alt="image" src="https://github.com/user-attachments/assets/df344099-47d7-4da1-8c28-479ae4d4f349" />
<img width="763" height="909" alt="image" src="https://github.com/user-attachments/assets/c8d0c81c-ce2d-4746-afae-dbdb0f45cb99" />
<img width="761" height="355" alt="image" src="https://github.com/user-attachments/assets/77b87dcd-3961-4438-aa5c-c5be6119fb8f" />

## Future imporvements
Right now the project uses only the exported model, which is not ideal when new users are registered, the preference of users change and new books are added.

**Solution:** This problem in a real-world solution could be solved by incorporating a pipeline which will continously evaluate the model's NDCG and re-train the model if it falls below a certain threshold.
