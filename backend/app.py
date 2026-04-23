import os

from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import create_engine, text
import torch

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://isa_user:isa_password@localhost:5432/isa_db",
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)


def _row_to_book(row, keys):
    return dict(zip(keys, row))


def _find_first_state_key(state_dict, suffix):
    for key in state_dict.keys():
        if key.endswith(suffix):
            return key
    return None


class TorchCheckpointRecommender:
    def __init__(self, checkpoint_path):
        self.checkpoint_path = checkpoint_path
        self.loaded = False
        self.error = None
        self.item2idx = {}
        self.user2idx = {}
        self.idx2item = {}
        self.item_features = None
        self.cf_item_emb = None
        self.cf_user_emb = None
        self.item_bias = None
        self._load()

    def _safe_to_int(self, value):
        try:
            return int(value)
        except (TypeError, ValueError):
            return None

    def _normalize_rows(self, matrix):
        norms = torch.norm(matrix, dim=1, keepdim=True).clamp_min(1e-12)
        return matrix / norms

    def _normalize_vec(self, vector):
        return vector / torch.norm(vector).clamp_min(1e-12)

    def _load(self):
        if not self.checkpoint_path or not os.path.exists(self.checkpoint_path):
            self.error = f"Checkpoint not found: {self.checkpoint_path}"
            return
        try:
            data = torch.load(self.checkpoint_path, map_location="cpu")
            self.item2idx = data.get("item2idx", {}) or {}
            self.user2idx = data.get("user2idx", {}) or {}
            self.idx2item = data.get("idx2item", {}) or {}

            item_emb_lookup = data.get("item_emb_lookup")
            item_cat_matrix = data.get("item_cat_matrix")
            item_author_ids = data.get("item_author_ids")
            model_state = data.get("model_state_dict", {}) or {}

            if item_emb_lookup is None or item_cat_matrix is None or item_author_ids is None:
                self.error = "Checkpoint is missing item_emb_lookup/item_cat_matrix/item_author_ids"
                return

            item_emb_lookup = item_emb_lookup.float()
            item_cat_matrix = item_cat_matrix.float()
            item_author_ids = item_author_ids.long()

            feature_parts = [item_emb_lookup, item_cat_matrix]
            author_key = _find_first_state_key(model_state, "author_emb.weight")
            if author_key and isinstance(model_state.get(author_key), torch.Tensor):
                author_table = model_state[author_key].float()
                safe_author_ids = item_author_ids.clamp(0, max(0, author_table.shape[0] - 1))
                author_features = author_table[safe_author_ids]
                feature_parts.append(author_features)

            self.item_features = self._normalize_rows(torch.cat(feature_parts, dim=1))

            cf_item_key = _find_first_state_key(model_state, "item_emb.weight")
            cf_user_key = _find_first_state_key(model_state, "user_emb.weight")
            if (
                cf_item_key
                and cf_user_key
                and isinstance(model_state.get(cf_item_key), torch.Tensor)
                and isinstance(model_state.get(cf_user_key), torch.Tensor)
            ):
                self.cf_item_emb = model_state[cf_item_key].float()
                self.cf_user_emb = model_state[cf_user_key].float()
                self.cf_item_emb = self._normalize_rows(self.cf_item_emb)
                self.cf_user_emb = self._normalize_rows(self.cf_user_emb)

            item_bias_key = _find_first_state_key(model_state, "item_bias.weight")
            if item_bias_key and isinstance(model_state.get(item_bias_key), torch.Tensor):
                bias_tensor = model_state[item_bias_key].float()
                self.item_bias = bias_tensor.reshape(-1)

            self.loaded = True
            self.error = None
        except Exception as exc:
            self.error = f"Failed to load checkpoint: {exc}"

    def _indices_from_asins(self, asins):
        indices = []
        for asin in asins:
            if asin in self.item2idx:
                idx = self._safe_to_int(self.item2idx[asin])
                if idx is not None and 0 <= idx < self.item_features.shape[0]:
                    indices.append(idx)
        return indices

    def _asins_from_indices(self, idxs):
        result = []
        for idx in idxs:
            key_int = idx
            key_str = str(idx)
            asin = self.idx2item.get(key_int)
            if asin is None:
                asin = self.idx2item.get(key_str)
            if asin:
                result.append(str(asin))
        return result

    def recommend(self, limit, user_id=None, seed_asins=None, exclude_asins=None):
        if not self.loaded:
            return []

        seed_asins = seed_asins or []
        exclude_asins = set(exclude_asins or [])
        max_items = self.item_features.shape[0] if self.item_features is not None else 0
        if max_items <= 0:
            return []

        scores = None

        # User route: prefer collaborative signal, analogous to eval(u_emb @ item_final_all.T + item_bias).
        if user_id is not None and self.cf_item_emb is not None and self.cf_user_emb is not None:
            if user_id in self.user2idx:
                user_idx = self._safe_to_int(self.user2idx[user_id])
                if user_idx is not None and 0 <= user_idx < self.cf_user_emb.shape[0]:
                    user_vec = self.cf_user_emb[user_idx]
                    cf_scores = self.cf_item_emb @ user_vec
                    cf_len = min(max_items, cf_scores.shape[0])
                    scores = torch.full((max_items,), float("-inf"), dtype=torch.float32)
                    scores[:cf_len] = cf_scores[:cf_len]

        # Cold-start route: content profile from selected ASINs.
        if scores is None:
            seed_indices = self._indices_from_asins(seed_asins)
            if seed_indices:
                profile = self.item_features[seed_indices].mean(dim=0)
                profile = self._normalize_vec(profile)
                scores = self.item_features @ profile

        if scores is None:
            return []

        if self.item_bias is not None:
            bias_len = min(scores.shape[0], self.item_bias.shape[0])
            scores[:bias_len] += self.item_bias[:bias_len]

        for asin in exclude_asins:
            idx_val = self.item2idx.get(asin)
            idx = self._safe_to_int(idx_val)
            if idx is not None and 0 <= idx < scores.shape[0]:
                scores[idx] = float("-inf")

        top_k = min(limit, scores.shape[0])
        top_indices = torch.topk(scores, k=top_k).indices.tolist()
        asins = self._asins_from_indices(top_indices)
        return asins[:limit]


def _resolve_checkpoint_path():
    explicit_path = os.getenv("RECOMMENDER_CHECKPOINT_PATH")
    if explicit_path:
        return explicit_path

    model_dir = os.getenv("RECOMMENDER_MODEL_DIR", "/app/model")
    if not os.path.isdir(model_dir):
        return None

    candidates = []
    for fname in os.listdir(model_dir):
        lower = fname.lower()
        if lower.endswith(".pt") or lower.endswith(".pth") or lower.endswith(".ckpt"):
            candidates.append(os.path.join(model_dir, fname))
    candidates.sort()
    return candidates[0] if candidates else None


RECOMMENDER = TorchCheckpointRecommender(_resolve_checkpoint_path())
print(
    "[recommender] path="
    f"{RECOMMENDER.checkpoint_path} loaded={RECOMMENDER.loaded} error={RECOMMENDER.error}"
)


@app.route("/api/users")
def list_users():
    search = request.args.get("search", "").strip()
    page = max(1, int(request.args.get("page", 1)))
    limit = min(100, max(1, int(request.args.get("limit", 20))))
    offset = (page - 1) * limit

    with engine.connect() as conn:
        if search:
            users_q = text(
                "SELECT user_id FROM users WHERE user_id ILIKE :q ORDER BY user_id LIMIT :lim OFFSET :off"
            )
            count_q = text("SELECT COUNT(*) FROM users WHERE user_id ILIKE :q")
            params = {"q": f"%{search}%", "lim": limit, "off": offset}
            count_params = {"q": f"%{search}%"}
        else:
            users_q = text("SELECT user_id FROM users ORDER BY user_id LIMIT :lim OFFSET :off")
            count_q = text("SELECT COUNT(*) FROM users")
            params = {"lim": limit, "off": offset}
            count_params = {}

        rows = conn.execute(users_q, params).fetchall()
        total = conn.execute(count_q, count_params).scalar()

    users = [{"user_id": r[0]} for r in rows]
    return jsonify({"users": users, "total": total, "page": page, "limit": limit})


@app.route("/api/users/<path:user_id>/exists")
def user_exists(user_id):
    with engine.connect() as conn:
        row = conn.execute(
            text("SELECT user_id FROM users WHERE user_id = :uid LIMIT 1"),
            {"uid": user_id},
        ).fetchone()

    if not row:
        return jsonify({"exists": False, "user_id": user_id}), 404

    return jsonify({"exists": True, "user_id": row[0]})


BOOK_SELECT = """
    SELECT
        b.asin,
        b.title,
        b.subtitle,
        b.author,
        b.average_rating,
        b.rating_number,
        b.price,
        b.images,
        b.main_category,
        b.categories,
        b.description,
        b.store,
        b.features
"""
BOOK_KEYS = [
    "asin", "title", "subtitle", "author", "average_rating", "rating_number",
    "price", "images", "main_category", "categories", "description", "store", "features",
]


@app.route("/api/users/<path:user_id>/books")
def user_books(user_id):
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                BOOK_SELECT
                + """,
        r.rating    AS user_rating,
        r.title     AS review_title,
        r.timestamp AS review_ts
    FROM reviews r
    JOIN books b ON b.asin = r.asin
    WHERE r.user_id = :uid
    ORDER BY r.timestamp DESC NULLS LAST
    LIMIT 50
"""
            ),
            {"uid": user_id},
        ).fetchall()

    books = []
    for r in rows:
        book = _row_to_book(r, BOOK_KEYS + ["user_rating", "review_title", "review_ts"])
        books.append(book)

    return jsonify({"books": books, "user_id": user_id})


@app.route("/api/recommend/<path:user_id>")
def recommend(user_id):
    with engine.connect() as conn:
        reviewed = conn.execute(
            text("SELECT asin FROM reviews WHERE user_id = :uid"),
            {"uid": user_id},
        ).fetchall()
        reviewed_asins = [r[0] for r in reviewed] or ["__none__"]

        model_asins = RECOMMENDER.recommend(
            limit=16,
            user_id=user_id,
            seed_asins=reviewed_asins[:50],
            exclude_asins=reviewed_asins,
        )
        print(f"[recommender] user_id={user_id} model_asins={model_asins}")
        if not model_asins:
            return jsonify({"recommendations": [], "user_id": user_id})

        rows = conn.execute(
            text(
                BOOK_SELECT
                + """
    FROM books b
    WHERE b.asin = ANY(:asins)
      AND b.title IS NOT NULL
      AND b.average_rating IS NOT NULL
    LIMIT :limit
"""
            ),
            {"asins": model_asins, "limit": len(model_asins)},
        ).fetchall()

    recommendations = [_row_to_book(r, BOOK_KEYS) for r in rows]
    rank = {asin: i for i, asin in enumerate(model_asins)}
    recommendations.sort(key=lambda b: rank.get(b["asin"], 10**9))
    return jsonify({"recommendations": recommendations, "user_id": user_id})


@app.route("/api/books/<path:asin>")
def get_book(asin):
    with engine.connect() as conn:
        row = conn.execute(
            text(
                BOOK_SELECT
                + """
    FROM books b
    WHERE b.asin = :asin
    LIMIT 1
"""
            ),
            {"asin": asin},
        ).fetchone()

    if row is None:
        return jsonify({"error": "Book not found", "asin": asin}), 404

    return jsonify({"book": _row_to_book(row, BOOK_KEYS)})


@app.route("/api/books/<path:asin>/reviews")
def get_book_reviews(asin):
    limit = min(100, max(1, int(request.args.get("limit", 20))))
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                SELECT
                    r.user_id,
                    r.rating,
                    r.title,
                    r.text,
                    r.timestamp,
                    r.helpful_vote,
                    r.verified_purchase
                FROM reviews r
                WHERE r.asin = :asin
                ORDER BY r.timestamp DESC NULLS LAST
                LIMIT :limit
                """
            ),
            {"asin": asin, "limit": limit},
        ).fetchall()

    review_keys = [
        "user_id",
        "rating",
        "title",
        "text",
        "timestamp",
        "helpful_vote",
        "verified_purchase",
    ]
    reviews = [_row_to_book(row, review_keys) for row in rows]
    return jsonify({"reviews": reviews, "asin": asin, "limit": limit})


@app.route("/api/books")
def list_books():
    search = request.args.get("search", "").strip()
    page = max(1, int(request.args.get("page", 1)))
    limit = min(100, max(1, int(request.args.get("limit", 20))))
    offset = (page - 1) * limit

    with engine.connect() as conn:
        if search:
            books_q = text(
                BOOK_SELECT
                + """
                FROM books b
                WHERE b.title ILIKE :q
                   OR COALESCE(b.subtitle, '') ILIKE :q
                   OR COALESCE(CAST(b.author AS TEXT), '') ILIKE :q
                   OR COALESCE(b.main_category, '') ILIKE :q
                ORDER BY b.rating_number DESC NULLS LAST, b.average_rating DESC NULLS LAST
                LIMIT :lim OFFSET :off
                """
            )
            count_q = text(
                """
                SELECT COUNT(*)
                FROM books b
                WHERE b.title ILIKE :q
                   OR COALESCE(b.subtitle, '') ILIKE :q
                   OR COALESCE(CAST(b.author AS TEXT), '') ILIKE :q
                   OR COALESCE(b.main_category, '') ILIKE :q
                """
            )
            params = {"q": f"%{search}%", "lim": limit, "off": offset}
            count_params = {"q": f"%{search}%"}
        else:
            books_q = text(
                BOOK_SELECT
                + """
                FROM books b
                WHERE b.title IS NOT NULL
                  AND TRIM(b.title) != ''
                ORDER BY b.rating_number DESC NULLS LAST, b.average_rating DESC NULLS LAST
                LIMIT :lim OFFSET :off
                """
            )
            count_q = text(
                """
                SELECT COUNT(*)
                FROM books b
                WHERE b.title IS NOT NULL
                  AND TRIM(b.title) != ''
                """
            )
            params = {"lim": limit, "off": offset}
            count_params = {}

        rows = conn.execute(books_q, params).fetchall()
        total = conn.execute(count_q, count_params).scalar()

    books = [_row_to_book(row, BOOK_KEYS) for row in rows]
    return jsonify({"books": books, "total": total, "page": page, "limit": limit, "search": search})


@app.route("/api/books/popular")
def popular_books():
    limit = min(300, max(5, int(request.args.get("limit", 20))))
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                WITH ranked AS (
                    SELECT
                        b.asin,
                        b.title,
                        b.subtitle,
                        b.author,
                        b.average_rating,
                        b.rating_number,
                        b.price,
                        b.images,
                        b.main_category,
                        b.categories,
                        b.description,
                        b.store,
                        b.features,
                        ROW_NUMBER() OVER (
                            PARTITION BY LOWER(TRIM(b.title))
                            ORDER BY b.rating_number DESC, b.average_rating DESC, b.asin
                        ) AS title_rank
                    FROM books b
                    WHERE b.title IS NOT NULL
                      AND TRIM(b.title) != ''
                      AND b.average_rating IS NOT NULL
                      AND b.rating_number IS NOT NULL
                )
                SELECT
                    asin,
                    title,
                    subtitle,
                    author,
                    average_rating,
                    rating_number,
                    price,
                    images,
                    main_category,
                    categories,
                    description,
                    store,
                    features
                FROM ranked
                WHERE title_rank = 1
                ORDER BY rating_number DESC, average_rating DESC
                LIMIT :limit
                """
            ),
            {"limit": limit},
        ).fetchall()

    books = [_row_to_book(r, BOOK_KEYS) for r in rows]
    return jsonify({"books": books, "limit": limit})


@app.route("/api/recommend/cold-start", methods=["POST"])
def cold_start_recommend():
    payload = request.get_json(silent=True) or {}
    asins = payload.get("asins", [])
    if not isinstance(asins, list) or len(asins) != 5:
        return jsonify({"error": "Request body must include exactly 5 selected ASINs"}), 400

    selected_asins = [str(asin) for asin in asins if asin]
    limit = min(30, max(1, int(payload.get("limit", 16))))

    with engine.connect() as conn:
        model_asins = RECOMMENDER.recommend(
            limit=limit,
            seed_asins=selected_asins,
            exclude_asins=selected_asins,
        )
        print(f"[recommender] cold_start seed_asins={selected_asins} model_asins={model_asins}")
        if not model_asins:
            return jsonify({"recommendations": [], "seed_asins": selected_asins})

        rows = conn.execute(
            text(
                BOOK_SELECT
                + """
    FROM books b
    WHERE b.asin = ANY(:asins)
      AND b.title IS NOT NULL
      AND b.average_rating IS NOT NULL
    LIMIT :limit
"""
            ),
            {"asins": model_asins, "limit": len(model_asins)},
        ).fetchall()

    recommendations = [_row_to_book(r, BOOK_KEYS) for r in rows]
    rank = {asin: i for i, asin in enumerate(model_asins)}
    recommendations.sort(key=lambda b: rank.get(b["asin"], 10**9))
    return jsonify({"recommendations": recommendations, "seed_asins": selected_asins})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
