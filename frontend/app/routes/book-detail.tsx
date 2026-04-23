import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  type Book,
  type BookReview,
  fetchBook,
  fetchUserById,
  fetchBookReviews,
  formatAuthor,
  formatCategories,
  formatDescription,
  getBookCover,
} from "../api/client";
import AppHeader from "../components/AppHeader";
import { CartProvider } from "../components/CartContext";
import Footer from "../components/Footer";

export default function BookDetailPage() {
  const { asin = "" } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [clickableUserIds, setClickableUserIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setBook(null);

    Promise.all([fetchBook(asin), fetchBookReviews(asin, 20)])
      .then(([bookRes, reviewsRes]) => {
        if (!cancelled) {
          setBook(bookRes.book);
          setReviews(reviewsRes.reviews);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [asin]);

  useEffect(() => {
    let cancelled = false;
    const uniqueUserIds = Array.from(new Set(reviews.map((review) => review.user_id).filter(Boolean)));

    if (uniqueUserIds.length === 0) {
      setClickableUserIds(new Set());
      return;
    }

    Promise.all(
      uniqueUserIds.map(async (userId) => {
        try {
          await fetchUserById(userId);
          return userId;
        } catch {
          return null;
        }
      })
    ).then((existingUserIds) => {
      if (cancelled) return;
      setClickableUserIds(new Set(existingUserIds.filter((userId): userId is string => Boolean(userId))));
    });

    return () => {
      cancelled = true;
    };
  }, [reviews]);

  const cover = book ? getBookCover(book) : null;
  const categories = book ? formatCategories(book.categories) : [];
  const description = book ? formatDescription(book.description) : "";
  const truncatedDescription =
    description.length > 500 ? `${description.slice(0, 500).trimEnd()}...` : description;
  const formatReviewDate = (timestamp: number | null) => {
    if (!timestamp) return null;
    const millis = timestamp > 1_000_000_000_000 ? timestamp : timestamp * 1000;
    return new Date(millis).toLocaleDateString();
  };

  return (
    <CartProvider>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
        <AppHeader />
        <Box sx={{ flex: 1 }}>
          <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
            <Button component={Link} to="/" startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>
              Back to Home
            </Button>

          {loading && (
            <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && error && (
            <Box sx={{ py: 8 }}>
              <Typography variant="h5" sx={{ mb: 1 }}>
                Couldn&apos;t load this book
              </Typography>
              <Typography color="text.secondary">{error}</Typography>
            </Box>
          )}

          {!loading && !error && book && (
            <Stack spacing={4}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
                  gap: { xs: 3, md: 5 },
                  alignItems: "start",
                }}
              >
                <Box
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    aspectRatio: "2/3",
                  }}
                >
                  {cover ? (
                    <Box component="img" src={cover} alt={book.title ?? "Book cover"} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Typography color="text.secondary">No cover image</Typography>
                    </Box>
                  )}
                </Box>

                <Stack spacing={2}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {book.title ?? "Untitled"}
                  </Typography>
                  {book.subtitle && (
                    <Typography variant="h6" color="text.secondary">
                      {book.subtitle}
                    </Typography>
                  )}

                  <Typography color="text.secondary">By {formatAuthor(book.author)}</Typography>

                  {book.average_rating != null && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Rating value={book.average_rating} precision={0.1} readOnly />
                      <Typography color="text.secondary">
                        {book.average_rating.toFixed(1)}
                        {book.rating_number != null && ` (${book.rating_number.toLocaleString()} ratings)`}
                      </Typography>
                    </Box>
                  )}

                  {book.price != null && (
                    <Typography variant="h6" sx={{ color: "primary.light", fontWeight: 700 }}>
                      ${book.price.toFixed(2)}
                    </Typography>
                  )}

                  {categories.length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {categories.map((category) => (
                        <Chip key={category} label={category} size="small" />
                      ))}
                    </Box>
                  )}

                  {truncatedDescription && (
                    <Typography sx={{ color: "text.secondary", lineHeight: 1.75 }}>
                      {truncatedDescription}
                    </Typography>
                  )}
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  User Reviews
                </Typography>
                {reviews.length === 0 ? (
                  <Typography color="text.secondary">No reviews found for this book.</Typography>
                ) : (
                  <Stack spacing={2}>
                    {reviews.map((review, index) => (
                      <Paper
                        key={`${review.user_id}-${review.timestamp ?? index}`}
                        elevation={0}
                        sx={{
                          p: { xs: 2, sm: 2.5 },
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 3,
                          bgcolor: "background.paper",
                          transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            borderColor: "primary.light",
                            boxShadow: (theme) => theme.shadows[2],
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 1.25, flexWrap: "wrap" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                bgcolor: "action.hover",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "text.secondary",
                                fontWeight: 700,
                                fontSize: 13,
                                textTransform: "uppercase",
                              }}
                            >
                              {review.user_id?.trim()?.[0] ?? "?"}
                            </Box>
                            <Box>
                              {clickableUserIds.has(review.user_id) ? (
                                <Typography
                                  component={Link}
                                  to={`/?userId=${encodeURIComponent(review.user_id)}`}
                                  variant="subtitle2"
                                  sx={{
                                    fontWeight: 700,
                                    lineHeight: 1.2,
                                    color: "text.primary",
                                    textDecoration: "none",
                                    "&:hover": {
                                      color: "primary.main",
                                      textDecoration: "underline",
                                    },
                                  }}
                                >
                                  {review.user_id}
                                </Typography>
                              ) : (
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontWeight: 700, lineHeight: 1.2, color: "text.secondary" }}
                                >
                                  {review.user_id}
                                </Typography>
                              )}
                              {formatReviewDate(review.timestamp) && (
                                <Typography variant="caption" color="text.secondary">
                                  {formatReviewDate(review.timestamp)}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <Rating
                              value={review.rating ?? 0}
                              precision={0.5}
                              size="small"
                              readOnly
                            />
                            {typeof review.rating === "number" && (
                              <Typography variant="caption" color="text.secondary">
                                {review.rating.toFixed(1)}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {review.title && (
                          <Typography sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.35 }}>{review.title}</Typography>
                        )}
                        {review.text && (
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                            {review.text}
                          </Typography>
                        )}

                        <Box sx={{ mt: 1.25, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                          {review.verified_purchase && (
                            <Chip label="Verified purchase" size="small" color="success" variant="outlined" />
                          )}
                          {typeof review.helpful_vote === "number" && review.helpful_vote > 0 && (
                            <Chip label={`${review.helpful_vote} helpful votes`} size="small" variant="outlined" />
                          )}
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>
            </Stack>
          )}
          </Container>
        </Box>
        <Footer />
      </Box>
    </CartProvider>
  );
}
