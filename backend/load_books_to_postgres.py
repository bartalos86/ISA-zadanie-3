import argparse
import gc
import gzip
import os
import re

import orjson
import pandas as pd
from sqlalchemy import JSON, BigInteger, Boolean, Float, ForeignKey, Index, Integer, Text, create_engine
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker
from tqdm import tqdm

DATASET_PATH = r"data/Books.jsonl.gz"
METADATA_PATH = r"data/meta_Books.jsonl.gz"
MAX_DATASET_SIZE = 0
DEFAULT_MIN_REVIEWS_PER_USER = 5
DEFAULT_MIN_REVIEWS_PER_BOOK = 5

DEFAULT_DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+psycopg2://isa_user:isa_password@localhost:5432/isa_db"
)
TABLE_NAME_PATTERN = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")
DEFAULT_USERS_TABLE = "users"
DEFAULT_BOOKS_TABLE = "books"
DEFAULT_REVIEWS_TABLE = "reviews"

REVIEW_COLS = [
    "rating",
    "title",
    "text",
    "images",
    "asin",
    "parent_asin",
    "user_id",
    "timestamp",
    "helpful_vote",
    "verified_purchase",
]

META_COLS = [
    "main_category",
    "title",
    "subtitle",
    "author",
    "average_rating",
    "rating_number",
    "features",
    "description",
    "price",
    "images",
    "videos",
    "store",
    "categories",
    "details",
    "parent_asin",
    "bought_together",
]

ORDERED_COLUMNS = [
    "rating",
    "title",
    "text",
    "images",
    "asin",
    "parent_asin",
    "user_id",
    "timestamp",
    "helpful_vote",
    "verified_purchase",
    "meta_main_category",
    "meta_title",
    "meta_subtitle",
    "meta_author",
    "meta_average_rating",
    "meta_rating_number",
    "meta_features",
    "meta_description",
    "meta_price",
    "meta_images",
    "meta_videos",
    "meta_store",
    "meta_categories",
    "meta_details",
    "meta_parent_asin",
    "meta_bought_together",
]


class Base(DeclarativeBase):
    pass


def build_users_model(table_name):
    class User(Base):
        __tablename__ = table_name

        user_id: Mapped[str] = mapped_column(Text, primary_key=True)

    return User


def build_books_model(table_name):
    class Book(Base):
        __tablename__ = table_name
        __table_args__ = (Index(f"idx_{table_name}_parent_asin", "parent_asin"),)

        asin: Mapped[str] = mapped_column(Text, primary_key=True)
        parent_asin: Mapped[str | None] = mapped_column(Text, nullable=True)
        main_category: Mapped[str | None] = mapped_column(Text, nullable=True)
        title: Mapped[str | None] = mapped_column(Text, nullable=True)
        subtitle: Mapped[str | None] = mapped_column(Text, nullable=True)
        author: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
        average_rating: Mapped[float | None] = mapped_column(Float, nullable=True)
        rating_number: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
        features: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
        description: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
        price: Mapped[float | None] = mapped_column(Float, nullable=True)
        images: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
        videos: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
        store: Mapped[str | None] = mapped_column(Text, nullable=True)
        categories: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
        details: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
        bought_together: Mapped[str | None] = mapped_column(Text, nullable=True)

    return Book


def build_reviews_model(table_name, users_table_name, books_table_name):
    class Review(Base):
        __tablename__ = table_name
        __table_args__ = (
            Index(f"idx_{table_name}_asin", "asin"),
            Index(f"idx_{table_name}_user_id", "user_id"),
            Index(f"idx_{table_name}_user_asin", "user_id", "asin"),
        )

        id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
        user_id: Mapped[str] = mapped_column(ForeignKey(f"{users_table_name}.user_id"), nullable=False)
        asin: Mapped[str] = mapped_column(ForeignKey(f"{books_table_name}.asin"), nullable=False)
        parent_asin: Mapped[str | None] = mapped_column(Text, nullable=True)
        rating: Mapped[float | None] = mapped_column(Float, nullable=True)
        title: Mapped[str | None] = mapped_column(Text, nullable=True)
        text: Mapped[str | None] = mapped_column(Text, nullable=True)
        images: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
        timestamp: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
        helpful_vote: Mapped[int | None] = mapped_column(Integer, nullable=True)
        verified_purchase: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    return Review


def load_dataset(dataset_path, max_size=MAX_DATASET_SIZE, keep_cols=None):
    rows = []
    with gzip.open(dataset_path, "rb") as raw_data:
        for i, line in enumerate(tqdm(raw_data, desc="Reading dataset", total=max_size), 1):
            if not line.strip():
                continue
            if max_size != 0 and i > max_size:
                break
            row = orjson.loads(line)
            if keep_cols is not None:
                row = {k: row[k] for k in keep_cols if k in row}
            rows.append(row)

    df = pd.DataFrame(rows)
    del rows
    gc.collect()
    print("Loaded rows:", len(df))
    df.info()
    return df


def load_meta(meta_path, reviews_df, max_size=0, keep_cols=None):
    review_asins = set(reviews_df["asin"].dropna().unique())
    rows = []

    with gzip.open(meta_path, "rb") as raw_data:
        for i, line in enumerate(
            tqdm(raw_data, desc="Reading metadata", total=max_size if max_size else None), 1
        ):
            if not line.strip():
                continue
            if max_size != 0 and i > max_size:
                break

            meta_obj = orjson.loads(line)
            parent_asin = meta_obj.get("parent_asin", None)
            if parent_asin in review_asins:
                review_asins.remove(parent_asin)
                if keep_cols is not None:
                    meta_obj = {k: meta_obj[k] for k in keep_cols if k in meta_obj}
                rows.append(meta_obj)
                if not review_asins:
                    break

    df = pd.DataFrame(rows)
    del rows
    gc.collect()
    print("Loaded metadata rows:", len(df))
    df.info()
    return df


def _is_missing(value):
    if value is None:
        return True
    if isinstance(value, (list, dict)):
        return False
    try:
        missing = pd.isna(value)
    except Exception:
        return False
    if hasattr(missing, "shape") and getattr(missing, "shape", ()) != ():
        return False
    return bool(missing)


def _to_json(value):
    if _is_missing(value):
        return None
    if isinstance(value, (dict, list)):
        return value
    return value


def _to_text(value):
    if _is_missing(value):
        return None
    return str(value)


def _to_bool(value):
    if _is_missing(value):
        return None
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    lowered = str(value).strip().lower()
    if lowered in {"true", "1", "yes", "y"}:
        return True
    if lowered in {"false", "0", "no", "n"}:
        return False
    return None


def _extract_number(text_value):
    match = re.search(r"-?\d+(?:\.\d+)?", text_value.replace(",", ""))
    if not match:
        return None
    return match.group(0)


def _to_float(value):
    if _is_missing(value):
        return None
    if isinstance(value, bool):
        return float(value)
    if isinstance(value, (int, float)):
        return float(value)
    number_part = _extract_number(str(value))
    if number_part is None:
        return None
    try:
        return float(number_part)
    except ValueError:
        return None


def _to_int(value):
    numeric = _to_float(value)
    if numeric is None:
        return None
    return int(numeric)


def _clean_interaction_row(raw_row):
    return {
        "rating": _to_float(raw_row.get("rating")),
        "title": _to_text(raw_row.get("title")),
        "text": _to_text(raw_row.get("text")),
        "images": _to_json(raw_row.get("images")),
        "asin": _to_text(raw_row.get("asin")),
        "parent_asin": _to_text(raw_row.get("parent_asin")),
        "user_id": _to_text(raw_row.get("user_id")),
        "timestamp": _to_int(raw_row.get("timestamp")),
        "helpful_vote": _to_int(raw_row.get("helpful_vote")),
        "verified_purchase": _to_bool(raw_row.get("verified_purchase")),
        "meta_main_category": _to_text(raw_row.get("meta_main_category")),
        "meta_title": _to_text(raw_row.get("meta_title")),
        "meta_subtitle": _to_text(raw_row.get("meta_subtitle")),
        "meta_author": _to_json(raw_row.get("meta_author")),
        "meta_average_rating": _to_float(raw_row.get("meta_average_rating")),
        "meta_rating_number": _to_int(raw_row.get("meta_rating_number")),
        "meta_features": _to_json(raw_row.get("meta_features")),
        "meta_description": _to_json(raw_row.get("meta_description")),
        "meta_price": _to_float(raw_row.get("meta_price")),
        "meta_images": _to_json(raw_row.get("meta_images")),
        "meta_videos": _to_json(raw_row.get("meta_videos")),
        "meta_store": _to_text(raw_row.get("meta_store")),
        "meta_categories": _to_json(raw_row.get("meta_categories")),
        "meta_details": _to_json(raw_row.get("meta_details")),
        "meta_parent_asin": _to_text(raw_row.get("meta_parent_asin")),
        "meta_bought_together": _to_text(raw_row.get("meta_bought_together")),
    }


def validate_table_name(table_name, label):
    if not TABLE_NAME_PATTERN.match(table_name):
        raise ValueError(f"Invalid {label} name: '{table_name}'.")


def _get_col(df, name):
    if name in df.columns:
        return df[name]
    return pd.Series([None] * len(df))


def _prepare_users(interactions_df):
    users = interactions_df[["user_id"]].copy()
    users = users.dropna(subset=["user_id"]).drop_duplicates(subset=["user_id"])
    users["user_id"] = users["user_id"].map(_to_text)
    return users


def _prepare_books(interactions_df):
    meta_parent_asin = _get_col(interactions_df, "meta_parent_asin")
    parent_asin = _get_col(interactions_df, "parent_asin")
    books = pd.DataFrame(
        {
            "asin": _get_col(interactions_df, "asin"),
            "parent_asin": meta_parent_asin.combine_first(parent_asin),
            "main_category": _get_col(interactions_df, "meta_main_category"),
            "title": _get_col(interactions_df, "meta_title"),
            "subtitle": _get_col(interactions_df, "meta_subtitle"),
            "author": _get_col(interactions_df, "meta_author"),
            "average_rating": _get_col(interactions_df, "meta_average_rating"),
            "rating_number": _get_col(interactions_df, "meta_rating_number"),
            "features": _get_col(interactions_df, "meta_features"),
            "description": _get_col(interactions_df, "meta_description"),
            "price": _get_col(interactions_df, "meta_price"),
            "images": _get_col(interactions_df, "meta_images"),
            "videos": _get_col(interactions_df, "meta_videos"),
            "store": _get_col(interactions_df, "meta_store"),
            "categories": _get_col(interactions_df, "meta_categories"),
            "details": _get_col(interactions_df, "meta_details"),
            "bought_together": _get_col(interactions_df, "meta_bought_together"),
        }
    )

    books = books.dropna(subset=["asin"]).drop_duplicates(subset=["asin"], keep="first")
    return books


def _prepare_reviews(interactions_df):
    reviews = pd.DataFrame(
        {
            "user_id": _get_col(interactions_df, "user_id"),
            "asin": _get_col(interactions_df, "asin"),
            "parent_asin": _get_col(interactions_df, "parent_asin"),
            "rating": _get_col(interactions_df, "rating"),
            "title": _get_col(interactions_df, "title"),
            "text": _get_col(interactions_df, "text"),
            "images": _get_col(interactions_df, "images"),
            "timestamp": _get_col(interactions_df, "timestamp"),
            "helpful_vote": _get_col(interactions_df, "helpful_vote"),
            "verified_purchase": _get_col(interactions_df, "verified_purchase"),
        }
    )
    reviews = reviews.dropna(subset=["user_id", "asin"])
    return reviews


def _chunked_records(df, cleaner, chunk_size):
    pending = []
    for values in df.itertuples(index=False, name=None):
        pending.append(cleaner(dict(zip(df.columns, values))))
        if len(pending) >= chunk_size:
            yield pending
            pending = []
    if pending:
        yield pending


def _clean_user_row(raw_row):
    return {"user_id": _to_text(raw_row.get("user_id"))}


def _clean_book_row(raw_row):
    return {
        "asin": _to_text(raw_row.get("asin")),
        "parent_asin": _to_text(raw_row.get("parent_asin")),
        "main_category": _to_text(raw_row.get("main_category")),
        "title": _to_text(raw_row.get("title")),
        "subtitle": _to_text(raw_row.get("subtitle")),
        "author": _to_json(raw_row.get("author")),
        "average_rating": _to_float(raw_row.get("average_rating")),
        "rating_number": _to_int(raw_row.get("rating_number")),
        "features": _to_json(raw_row.get("features")),
        "description": _to_json(raw_row.get("description")),
        "price": _to_float(raw_row.get("price")),
        "images": _to_json(raw_row.get("images")),
        "videos": _to_json(raw_row.get("videos")),
        "store": _to_text(raw_row.get("store")),
        "categories": _to_json(raw_row.get("categories")),
        "details": _to_json(raw_row.get("details")),
        "bought_together": _to_text(raw_row.get("bought_together")),
    }


def _clean_review_row(raw_row):
    return {
        "user_id": _to_text(raw_row.get("user_id")),
        "asin": _to_text(raw_row.get("asin")),
        "parent_asin": _to_text(raw_row.get("parent_asin")),
        "rating": _to_float(raw_row.get("rating")),
        "title": _to_text(raw_row.get("title")),
        "text": _to_text(raw_row.get("text")),
        "images": _to_json(raw_row.get("images")),
        "timestamp": _to_int(raw_row.get("timestamp")),
        "helpful_vote": _to_int(raw_row.get("helpful_vote")),
        "verified_purchase": _to_bool(raw_row.get("verified_purchase")),
    }


def insert_users(engine, users_model, users_df, chunk_size):
    if users_df.empty:
        return
    for chunk in tqdm(
        _chunked_records(users_df, _clean_user_row, chunk_size),
        desc="Inserting users",
        total=(len(users_df) + chunk_size - 1) // chunk_size,
    ):
        with engine.begin() as conn:
            stmt = pg_insert(users_model.__table__).values(chunk)
            stmt = stmt.on_conflict_do_nothing(index_elements=["user_id"])
            conn.execute(stmt)


def insert_books(engine, books_model, books_df, chunk_size):
    if books_df.empty:
        return
    for chunk in tqdm(
        _chunked_records(books_df, _clean_book_row, chunk_size),
        desc="Inserting books",
        total=(len(books_df) + chunk_size - 1) // chunk_size,
    ):
        with engine.begin() as conn:
            stmt = pg_insert(books_model.__table__).values(chunk)
            stmt = stmt.on_conflict_do_nothing(index_elements=["asin"])
            conn.execute(stmt)


def insert_reviews(session, reviews_model, reviews_df, chunk_size):
    if reviews_df.empty:
        return
    for chunk in tqdm(
        _chunked_records(reviews_df, _clean_review_row, chunk_size),
        desc="Inserting reviews",
        total=(len(reviews_df) + chunk_size - 1) // chunk_size,
    ):
        session.bulk_insert_mappings(reviews_model, chunk)
        session.commit()


def filter_interactions_for_training(interactions_df, min_reviews_per_user, min_reviews_per_book):
    filtered = interactions_df.copy()

    user_counts = filtered["user_id"].value_counts()
    good_users = user_counts[user_counts >= min_reviews_per_user].index
    filtered = filtered[filtered["user_id"].isin(good_users)].copy()

    item_counts = filtered["asin"].value_counts()
    good_items = item_counts[item_counts >= min_reviews_per_book].index
    filtered = filtered[filtered["asin"].isin(good_items)].copy()

    return filtered


def create_or_replace_user_book_reviews_view(engine, users_table, books_table, reviews_table):
    view_sql = f"""
    CREATE OR REPLACE VIEW user_book_reviews AS
    SELECT
        r.id AS review_id,
        r.user_id,
        r.asin,
        r.parent_asin,
        r.rating,
        r.title AS review_title,
        r.text AS review_text,
        r.images AS review_images,
        r.timestamp AS review_timestamp,
        r.helpful_vote,
        r.verified_purchase,
        b.parent_asin AS book_parent_asin,
        b.main_category,
        b.title AS book_title,
        b.subtitle AS book_subtitle,
        b.author AS book_author,
        b.average_rating AS book_average_rating,
        b.rating_number AS book_rating_number,
        b.features AS book_features,
        b.description AS book_description,
        b.price AS book_price,
        b.images AS book_images,
        b.videos AS book_videos,
        b.store AS book_store,
        b.categories AS book_categories,
        b.details AS book_details,
        b.bought_together AS book_bought_together
    FROM {reviews_table} r
    JOIN {users_table} u ON u.user_id = r.user_id
    JOIN {books_table} b ON b.asin = r.asin;
    """
    with engine.begin() as conn:
        conn.exec_driver_sql(view_sql)


def main():
    parser = argparse.ArgumentParser(
        description="Read Amazon Books jsonl.gz files and load merged data into Postgres via SQLAlchemy ORM."
    )
    parser.add_argument("--dataset-path", default=DATASET_PATH, help="Path to Books.jsonl.gz")
    parser.add_argument("--metadata-path", default=METADATA_PATH, help="Path to meta_Books.jsonl.gz")
    parser.add_argument("--database-url", default=DEFAULT_DATABASE_URL, help="SQLAlchemy Postgres URL")
    parser.add_argument("--users-table", default=DEFAULT_USERS_TABLE, help="Users table name")
    parser.add_argument("--books-table", default=DEFAULT_BOOKS_TABLE, help="Books table name")
    parser.add_argument("--reviews-table", default=DEFAULT_REVIEWS_TABLE, help="Reviews table name")
    parser.add_argument(
        "--max-size",
        type=int,
        default=MAX_DATASET_SIZE,
        help="Max number of review rows to read (0 = all)",
    )
    parser.add_argument(
        "--meta-max-size",
        type=int,
        default=0,
        help="Max number of metadata rows to scan (0 = all)",
    )
    parser.add_argument("--chunk-size", type=int, default=2000, help="Insert batch size")
    parser.add_argument(
        "--truncate",
        action="store_true",
        help="Truncate table before inserting new data",
    )
    parser.add_argument(
        "--min-reviews-per-user",
        type=int,
        default=DEFAULT_MIN_REVIEWS_PER_USER,
        help="Keep only users with at least this many reviews",
    )
    parser.add_argument(
        "--min-reviews-per-book",
        type=int,
        default=DEFAULT_MIN_REVIEWS_PER_BOOK,
        help="Keep only books with at least this many reviews",
    )
    args = parser.parse_args()

    validate_table_name(args.users_table, "users table")
    validate_table_name(args.books_table, "books table")
    validate_table_name(args.reviews_table, "reviews table")

    reviews = load_dataset(args.dataset_path, max_size=args.max_size, keep_cols=REVIEW_COLS)
    metadata = load_meta(
        args.metadata_path,
        reviews,
        max_size=args.meta_max_size,
        keep_cols=META_COLS,
    )

    metadata = metadata.drop_duplicates(subset="parent_asin")
    interactions = reviews.merge(
        metadata.add_prefix("meta_"),
        left_on="asin",
        right_on="meta_parent_asin",
        how="left",
    )
    print("Merged interactions rows:", len(interactions))
    interactions = filter_interactions_for_training(
        interactions,
        min_reviews_per_user=args.min_reviews_per_user,
        min_reviews_per_book=args.min_reviews_per_book,
    )
    print(
        "Filtered interactions rows "
        f"(user>={args.min_reviews_per_user}, book>={args.min_reviews_per_book}):",
        len(interactions),
    )

    users_df = _prepare_users(interactions)
    books_df = _prepare_books(interactions)
    reviews_df = _prepare_reviews(interactions)
    print("Users to insert:", len(users_df))
    print("Books to insert:", len(books_df))
    print("Reviews to insert:", len(reviews_df))

    users_model = build_users_model(args.users_table)
    books_model = build_books_model(args.books_table)
    reviews_model = build_reviews_model(args.reviews_table, args.users_table, args.books_table)
    engine = create_engine(args.database_url, pool_pre_ping=True)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

    Base.metadata.create_all(
        engine, tables=[users_model.__table__, books_model.__table__, reviews_model.__table__]
    )
    create_or_replace_user_book_reviews_view(
        engine,
        users_table=args.users_table,
        books_table=args.books_table,
        reviews_table=args.reviews_table,
    )

    if args.truncate:
        with engine.begin() as conn:
            conn.execute(reviews_model.__table__.delete())
            conn.execute(books_model.__table__.delete())
            conn.execute(users_model.__table__.delete())

    session = SessionLocal()
    try:
        insert_users(engine, users_model, users_df, chunk_size=args.chunk_size)
        insert_books(engine, books_model, books_df, chunk_size=args.chunk_size)
        insert_reviews(session, reviews_model, reviews_df, chunk_size=args.chunk_size)
    finally:
        session.close()

    print(
        f"Done. Loaded users/books/reviews into "
        f"'{args.users_table}', '{args.books_table}', '{args.reviews_table}'."
    )
    print("Created/updated SQL view: user_book_reviews")


if __name__ == "__main__":
    main()
