import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RecommendIcon from "@mui/icons-material/Recommend";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { type Book, fetchRecommendations } from "../api/client";
import BookCard from "./BookCard";
import EmptyState from "./EmptyState";

interface RecommendationsSectionProps {
  userId: string;
}

function BookSkeletons() {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: 8 }).map((_, i) => (
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

export default function RecommendationsSection({ userId }: RecommendationsSectionProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const getRecommendations = async () => {
    setLoading(true);
    setError(null);
    setFetched(true);
    try {
      const res = await fetchRecommendations(userId);
      setBooks(res.recommendations);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch recommendations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            background: "linear-gradient(135deg, #f0a060, #c07030)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 14px rgba(240,160,96,0.35)",
          }}
        >
          <AutoAwesomeIcon sx={{ color: "#fff", fontSize: 18 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
            Recommended for You
          </Typography>
          {!loading && books.length > 0 && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {books.length} personalized picks
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          color="secondary"
          size="medium"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RecommendIcon />}
          onClick={getRecommendations}
          disabled={loading}
          sx={{
            px: 3,
            py: 1,
            background: "linear-gradient(135deg, #f0a060, #c07030)",
            color: "#120c00",
            fontWeight: 700,
            "&:hover": {
              background: "linear-gradient(135deg, #ffcc90, #f0a060)",
            },
            "&:disabled": {
              opacity: 0.6,
            },
          }}
        >
          {loading ? "Loading…" : fetched ? "Refresh" : "Get Recommendations"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading && <BookSkeletons />}

      {!loading && !fetched && (
        <Box
          sx={{
            border: "2px dashed",
            borderColor: "rgba(240,160,96,0.2)",
            borderRadius: 3,
            py: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
            background: "rgba(240,160,96,0.03)",
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 40, color: "secondary.main", opacity: 0.5 }} />
          <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 600 }}>
            Ready to discover books?
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", maxWidth: 360 }}>
            Click &ldquo;Get Recommendations&rdquo; to generate personalized book picks based on this
            user&apos;s reading history.
          </Typography>
        </Box>
      )}

      {!loading && fetched && books.length === 0 && !error && (
        <EmptyState
          icon={<AutoAwesomeIcon />}
          title="No recommendations available"
          subtitle="We couldn't generate recommendations for this user at the moment."
        />
      )}

      {!loading && books.length > 0 && (
        <Grid container spacing={2}>
          {books.map((book) => (
            <Grid key={book.asin} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
              <Box sx={{ height: "100%" }}>
                <BookCard book={book} />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
