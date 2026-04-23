import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { useEffect, useState } from "react";
import { type Book, fetchUserBooks } from "../api/client";
import BookCard from "./BookCard";
import EmptyState from "./EmptyState";

interface PurchasedSectionProps {
  userId: string;
}

function BookSkeletons() {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Grid key={i} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
          <Box>
            <Skeleton variant="rectangular" sx={{ aspectRatio: "2/3", borderRadius: 2 }} />
            <Skeleton variant="text" sx={{ mt: 1 }} />
            <Skeleton variant="text" width="60%" />
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

export default function PurchasedSection({ userId }: PurchasedSectionProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setBooks([]);

    fetchUserBooks(userId)
      .then((res) => {
        if (!cancelled) setBooks(res.books);
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
  }, [userId]);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            background: "linear-gradient(135deg, #7c6af7, #5040c8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 14px rgba(124,106,247,0.35)",
          }}
        >
          <ShoppingBagIcon sx={{ color: "#fff", fontSize: 18 }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
            Purchase History
          </Typography>
          {!loading && books.length > 0 && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {books.length} book{books.length !== 1 ? "s" : ""} reviewed
            </Typography>
          )}
        </Box>
        {loading && <CircularProgress size={20} sx={{ ml: "auto", color: "primary.light" }} />}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading && <BookSkeletons />}

      {!loading && !error && books.length === 0 && (
        <EmptyState
          icon={<HistoryEduIcon />}
          title="No purchases found"
          subtitle="This user has no purchase history in the database."
        />
      )}

      {!loading && books.length > 0 && (
        <Grid container spacing={2}>
          {books.map((book) => (
            <Grid key={book.asin} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
              <Box sx={{ height: "100%" }}>
                <BookCard book={book} showUserRating showAddToCart={false} />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
