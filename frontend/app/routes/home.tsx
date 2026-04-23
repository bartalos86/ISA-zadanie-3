import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { fetchBooks, fetchUserById, fetchUsers, type Book, type User } from "../api/client";
import AppHeader from "../components/AppHeader";
import BookCard from "../components/BookCard";
import { CartProvider } from "../components/CartContext";
import CategoryBrowser from "../components/CategoryBrowser";
import DealsSection from "../components/DealsSection";
import Footer from "../components/Footer";
import HeroBanner from "../components/HeroBanner";
import NewsletterBanner from "../components/NewsletterBanner";
import PurchasedSection from "../components/PurchasedSection";
import RecommendationsSection from "../components/RecommendationsSection";
import UserSelector from "../components/UserSelector";

export default function Home() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [quickUsers, setQuickUsers] = useState<User[]>([]);
  const [searchedBooks, setSearchedBooks] = useState<Book[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const bookQuery = searchParams.get("q")?.trim() ?? "";

  useEffect(() => {
    const userId = searchParams.get("userId")?.trim();
    if (!userId) return;

    let cancelled = false;

    fetchUserById(userId)
      .then((user) => {
        if (!cancelled) {
          setSelectedUser(user);
        }
      })
      .catch(() => {
        // Ignore non-existing users from URL query.
      })
      .finally(() => {
        if (cancelled) return;
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.delete("userId");
          return next;
        }, { replace: true });
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    let cancelled = false;

    fetchUsers("", 1, 24)
      .then((res) => {
        if (!cancelled) {
          setQuickUsers(res.users);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQuickUsers([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!bookQuery) {
      setSearchedBooks([]);
      setSearchTotal(0);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    fetchBooks(bookQuery, 1, 24)
      .then((res) => {
        if (cancelled) return;
        setSearchedBooks(res.books);
        setSearchTotal(res.total);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setSearchError(err.message);
        setSearchedBooks([]);
        setSearchTotal(0);
      })
      .finally(() => {
        if (!cancelled) {
          setSearchLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [bookQuery]);

  return (
    <CartProvider>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
        <AppHeader />

        <HeroBanner />
        {/* <CategoryBrowser /> */}
        {/* <DealsSection /> */}

        {/* Personalized recommendations section */}
        <Box
          sx={{
            background: "background.default",
            borderBottom: "1px solid",
            borderColor: "divider",
            py: { xs: 3, md: 4 },
          }}
        >
          <Container maxWidth="xl">
            {/* Section heading */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  background: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AutoAwesomeIcon sx={{ color: "#fff", fontSize: 18 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  AI-Powered Recommendations
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
                  Select a reader profile to explore their library and get personalized picks
                </Typography>
              </Box>
            </Box>

            {/* User selector card */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                maxWidth: 460,
                border: "1px solid",
                borderColor: "divider",
                background: "background.paper",
              }}
            >
              <UserSelector value={selectedUser} onChange={setSelectedUser} />

              {selectedUser && (
                <Box
                  sx={{
                    mt: 1.5,
                    pt: 1.5,
                    borderTop: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <PersonSearchIcon sx={{ color: "#fff", fontSize: 16 }} />
                  </Box>
                  <Box sx={{ overflow: "hidden" }}>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", display: "block" }}
                    >
                      Viewing profile for
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "monospace",
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: "primary.light",
                      }}
                    >
                      {selectedUser.user_id}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>

            {quickUsers.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
                  Quick profile picker
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    overflowX: "auto",
                    pb: 1,
                    pr: 1,
                    scrollbarWidth: "thin",
                  }}
                >
                  {quickUsers.map((user) => {
                    const isSelected = selectedUser?.user_id === user.user_id;
                    return (
                      <Box
                        key={user.user_id}
                        onClick={() => setSelectedUser(user)}
                        title={user.user_id}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 0.75,
                          minWidth: 72,
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            fontSize: 18,
                            fontWeight: 700,
                            bgcolor: isSelected ? "primary.main" : "action.hover",
                            color: isSelected ? "#fff" : "text.primary",
                            border: "2px solid",
                            borderColor: isSelected ? "primary.light" : "divider",
                          }}
                        >
                          {user.user_id.trim().slice(0, 1).toUpperCase()}
                        </Avatar>
                        <Typography
                          variant="caption"
                          sx={{
                            maxWidth: 72,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: isSelected ? "primary.light" : "text.secondary",
                            fontFamily: "monospace",
                            fontSize: "0.68rem",
                          }}
                        >
                          {user.user_id}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Container>
        </Box>

        {/* Main content: purchased + recommendations */}
        <Box sx={{ flex: 1 }}>
          <Container maxWidth="xl" sx={{ py: 4 }}>
            {bookQuery && (
              <Box sx={{ mb: 5 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Search Results
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                  {searchLoading
                    ? `Searching for "${bookQuery}"...`
                    : `${searchTotal.toLocaleString()} result${searchTotal === 1 ? "" : "s"} for "${bookQuery}"`}
                </Typography>

                {searchError && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {searchError}
                  </Alert>
                )}

                {searchLoading && (
                  <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
                    <CircularProgress />
                  </Box>
                )}

                {!searchLoading && !searchError && searchedBooks.length > 0 && (
                  <Grid container spacing={2}>
                    {searchedBooks.map((book) => (
                      <Grid key={book.asin} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                        <Box sx={{ height: "100%" }}>
                          <BookCard book={book} />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {!searchLoading && !searchError && searchedBooks.length === 0 && (
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    No books found for this query.
                  </Typography>
                )}
              </Box>
            )}
            {!selectedUser ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 10,
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 88,
                    height: 88,
                    borderRadius: "50%",
                    background: "rgba(124,106,247,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(124,106,247,0.15)",
                  }}
                >
                  <PersonSearchIcon sx={{ fontSize: 44, color: "primary.main", opacity: 0.5 }} />
                </Box>
                <Typography variant="h5" sx={{ color: "text.primary", fontWeight: 700 }}>
                  Select a user to get started
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "text.secondary", textAlign: "center", maxWidth: 400 }}
                >
                  Choose a reader from the search box above to view their purchased books and
                  generate AI-powered recommendations.
                </Typography>
                <Button component={Link} to="/onboarding" variant="outlined" sx={{ mt: 1 }}>
                  New user? Start onboarding
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <PurchasedSection userId={selectedUser.user_id} />
                <Divider />
                <RecommendationsSection userId={selectedUser.user_id} />
              </Box>
            )}
          </Container>
        </Box>

        {/* <NewsletterBanner /> */}
        <Footer />
      </Box>
    </CartProvider>
  );
}
