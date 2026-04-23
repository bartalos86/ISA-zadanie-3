export interface BookImage {
  thumb?: string;
  large?: string;
  hi_res?: string;
  variant?: string;
}

export interface Book {
  asin: string;
  title: string | null;
  subtitle: string | null;
  author: string | string[] | Record<string, unknown> | null;
  average_rating: number | null;
  rating_number: number | null;
  price: number | null;
  images: BookImage[] | null;
  main_category: string | null;
  categories: string[] | null;
  description: string | string[] | null;
  store: string | null;
  features: string[] | null;
  user_rating?: number | null;
  review_title?: string | null;
  review_ts?: number | null;
}

export interface BookReview {
  user_id: string;
  rating: number | null;
  title: string | null;
  text: string | null;
  timestamp: number | null;
  helpful_vote: number | null;
  verified_purchase: boolean | null;
}

export interface User {
  user_id: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface UserExistsResponse {
  exists: boolean;
  user_id: string;
}

export interface UserBooksResponse {
  books: Book[];
  user_id: string;
}

export interface RecommendationsResponse {
  recommendations: Book[];
  user_id: string;
}

export interface BookResponse {
  book: Book;
}

export interface PopularBooksResponse {
  books: Book[];
  limit: number;
}

export interface BooksResponse {
  books: Book[];
  total: number;
  page: number;
  limit: number;
  search: string;
}

export interface ColdStartRecommendationsResponse {
  recommendations: Book[];
  seed_asins: string[];
}

export interface BookReviewsResponse {
  reviews: BookReview[];
  asin: string;
  limit: number;
}

const BASE = "/api";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchUsers(
  search = "",
  page = 1,
  limit = 20
): Promise<UsersResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set("search", search);
  return apiFetch<UsersResponse>(`/users?${params}`);
}

export async function fetchUserById(userId: string): Promise<User> {
  const res = await apiFetch<UserExistsResponse>(`/users/${encodeURIComponent(userId)}/exists`);
  if (!res.exists) {
    throw new Error("User not found");
  }
  return { user_id: res.user_id };
}

export async function fetchUserBooks(userId: string): Promise<UserBooksResponse> {
  return apiFetch<UserBooksResponse>(`/users/${encodeURIComponent(userId)}/books`);
}

export async function fetchRecommendations(userId: string): Promise<RecommendationsResponse> {
  return apiFetch<RecommendationsResponse>(`/recommend/${encodeURIComponent(userId)}`);
}

export async function fetchBook(asin: string): Promise<BookResponse> {
  return apiFetch<BookResponse>(`/books/${encodeURIComponent(asin)}`);
}

export async function fetchBookReviews(asin: string, limit = 20): Promise<BookReviewsResponse> {
  return apiFetch<BookReviewsResponse>(
    `/books/${encodeURIComponent(asin)}/reviews?limit=${encodeURIComponent(String(limit))}`
  );
}

export async function fetchPopularBooks(limit = 20): Promise<PopularBooksResponse> {
  return apiFetch<PopularBooksResponse>(`/books/popular?limit=${encodeURIComponent(String(limit))}`);
}

export async function fetchBooks(
  search = "",
  page = 1,
  limit = 20
): Promise<BooksResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search.trim()) {
    params.set("search", search.trim());
  }
  return apiFetch<BooksResponse>(`/books?${params.toString()}`);
}

export async function fetchColdStartRecommendations(
  asins: string[],
  limit = 16
): Promise<ColdStartRecommendationsResponse> {
  return apiFetch<ColdStartRecommendationsResponse>("/recommend/cold-start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ asins, limit }),
  });
}

export function getBookCover(book: Book): string | null {
  if (!book.images || !Array.isArray(book.images) || book.images.length === 0) return null;
  const main = book.images.find((img) => img.variant === "MAIN") ?? book.images[0];
  return main?.large ?? main?.hi_res ?? main?.thumb ?? null;
}

export function formatAuthor(author: Book["author"]): string {
  if (!author) return "Unknown Author";
  if (typeof author === "string") return author;
  if (Array.isArray(author)) {
    return author
      .map((a) => (typeof a === "string" ? a : (a as Record<string, unknown>).name ?? ""))
      .filter(Boolean)
      .join(", ");
  }
  if (typeof author === "object" && "name" in author) {
    return String((author as Record<string, unknown>).name);
  }
  return "Unknown Author";
}

export function formatDescription(desc: Book["description"]): string {
  if (!desc) return "";
  if (typeof desc === "string") return desc;
  if (Array.isArray(desc)) return desc.join(" ");
  return "";
}

export function formatCategories(cats: Book["categories"]): string[] {
  if (!cats || !Array.isArray(cats)) return [];
  return cats.flat().filter((c): c is string => typeof c === "string").slice(0, 4);
}
