import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckIcon from "@mui/icons-material/Check";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  type Book,
  fetchColdStartRecommendations,
  fetchPopularBooks,
  formatAuthor,
  getBookCover,
} from "../api/client";
import AppHeader from "../components/AppHeader";
import BookCard from "../components/BookCard";
import { CartProvider } from "../components/CartContext";
import Footer from "../components/Footer";

const STEPS = ["Pick 5 books", "See your recommendations"];
const INITIAL_POPULAR_BOOKS = 50;
const POPULAR_BOOKS_INCREMENT = 25;

function PopularBookCard({
  book,
  selected,
  onToggle,
}: {
  book: Book;
  selected: boolean;
  onToggle: () => void;
}) {
  const cover = getBookCover(book);
  const title = book.title ?? "Untitled";

  return (
    <Card
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        background: "background.paper",
        transition: "border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
        transform: selected ? "translateY(-2px)" : "none",
        boxShadow: selected ? "0 10px 26px rgba(124,106,247,0.18)" : "none",
        "&:hover": {
          borderColor: selected ? "primary.main" : "rgba(124,106,247,0.45)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardActionArea onClick={onToggle} sx={{ height: "100%" }}>
        <Box sx={{ position: "relative" }}>
          <Box
            sx={{
              width: "100%",
              aspectRatio: "2/3",
              bgcolor: "background.default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {cover ? (
              <Box component="img" src={cover} alt={title} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <MenuBookIcon sx={{ fontSize: 44, color: "text.secondary" }} />
            )}
          </Box>

          {selected && (
            <Chip
              icon={<CheckIcon />}
              label="Selected"
              size="small"
              color="primary"
              sx={{ position: "absolute", top: 8, right: 8 }}
            />
          )}
        </Box>

        <CardContent sx={{ p: 1.25 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: 42,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {formatAuthor(book.author)}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function OnboardingPage() {
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [popularLimit, setPopularLimit] = useState(INITIAL_POPULAR_BOOKS);
  const [selectedAsins, setSelectedAsins] = useState<string[]>([]);
  const [recommended, setRecommended] = useState<Book[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingMorePopular, setLoadingMorePopular] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const isLoadMore = popularLimit > INITIAL_POPULAR_BOOKS;
    if (isLoadMore) {
      setLoadingMorePopular(true);
    } else {
      setLoadingPopular(true);
    }
    setError(null);

    fetchPopularBooks(popularLimit)
      .then((res) => {
        if (cancelled) return;
        if (isLoadMore) {
          setPopularBooks((prev) => {
            const existing = new Set(prev.map((book) => book.asin));
            const next = res.books.filter((book) => !existing.has(book.asin));
            return [...prev, ...next];
          });
        } else {
          setPopularBooks(res.books);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (cancelled) return;
        if (isLoadMore) {
          setLoadingMorePopular(false);
        } else {
          setLoadingPopular(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [popularLimit]);

  const selectedCount = selectedAsins.length;
  const selectedSet = useMemo(() => new Set(selectedAsins), [selectedAsins]);
  const canContinue = selectedCount === 5;

  const toggleSelection = (asin: string) => {
    setSelectedAsins((prev) => {
      if (prev.includes(asin)) return prev.filter((id) => id !== asin);
      if (prev.length >= 5) return prev;
      return [...prev, asin];
    });
  };

  const getRecommendations = async () => {
    if (!canContinue) return;
    setLoadingRecommendations(true);
    setError(null);
    try {
      const res = await fetchColdStartRecommendations(selectedAsins, 16);
      setRecommended(res.recommendations);
      setStep(1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load recommendations");
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const loadMorePopularBooks = () => {
    if (loadingPopular) return;
    setPopularLimit((prev) => prev + POPULAR_BOOKS_INCREMENT);
  };

  return (
    <CartProvider>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
        <AppHeader />
        <Box sx={{ flex: 1 }}>
          <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
            <Box sx={{ mb: 3.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                New Reader Onboarding
              </Typography>
              <Typography color="text.secondary">
                Pick 5 books you like, then we&apos;ll generate cold-start recommendations.
              </Typography>
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 2.5 },
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                mb: 3,
                background: "background.paper",
              }}
            >
              <Stepper
                activeStep={step}
                sx={{
                  "& .MuiStepLabel-label": {
                    color: "text.secondary",
                    fontWeight: 500,
                  },
                  "& .MuiStepLabel-label.Mui-active, & .MuiStepLabel-label.Mui-completed": {
                    color: "text.primary",
                    fontWeight: 700,
                  },
                  "& .MuiStepIcon-root": { color: "rgba(124,106,247,0.35)" },
                  "& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed": {
                    color: "primary.main",
                  },
                }}
              >
                {STEPS.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>

            {error && (
              <Typography color="error.main" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            {step === 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 2.5 },
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  background: "background.paper",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5, gap: 2, flexWrap: "wrap" }}>
                  <Typography variant="h6">
                    Step 1: Choose exactly 5 popular books
                  </Typography>
                  <Chip
                    color={canContinue ? "success" : "default"}
                    label={`${selectedCount}/5 selected`}
                  />
                </Box>

                {loadingPopular ? (
                  <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <Grid container spacing={2}>
                      {popularBooks.map((book) => (
                        <Grid key={book.asin} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                          <PopularBookCard
                            book={book}
                            selected={selectedSet.has(book.asin)}
                            onToggle={() => toggleSelection(book.asin)}
                          />
                        </Grid>
                      ))}
                    </Grid>
                    <Box sx={{ mt: 2.5, display: "flex", justifyContent: "center" }}>
                      <Button variant="outlined" onClick={loadMorePopularBooks} disabled={loadingMorePopular}>
                        {loadingMorePopular ? "Loading more..." : "Load more books"}
                      </Button>
                    </Box>
                  </>
                )}

                <Box sx={{ mt: 3.5, display: "flex", justifyContent: "space-between", gap: 1.5 }}>
                  <Button component={Link} to="/" variant="text">
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={getRecommendations}
                    disabled={!canContinue || loadingRecommendations}
                    startIcon={
                      loadingRecommendations ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />
                    }
                  >
                    {loadingRecommendations ? "Generating..." : "Get Recommendations"}
                  </Button>
                </Box>
              </Paper>
            )}

            {step === 1 && (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 2.5 },
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  background: "background.paper",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5, flexWrap: "wrap", gap: 1.5 }}>
                  <Typography variant="h6">Step 2: Recommendations from your picks</Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button variant="outlined" onClick={() => setStep(0)}>
                      Edit picks
                    </Button>
                    <Button
                      variant="contained"
                      onClick={getRecommendations}
                      disabled={loadingRecommendations}
                    >
                      Refresh
                    </Button>
                  </Box>
                </Box>

                {loadingRecommendations ? (
                  <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {recommended.map((book) => (
                      <Grid key={book.asin} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                        <Box sx={{ height: "100%" }}>
                          <BookCard book={book} />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            )}
          </Container>
        </Box>
        <Footer />
      </Box>
    </CartProvider>
  );
}
