import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PersonOutlineIcon from "@mui/icons-material/Person2Outlined";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AppBar from "@mui/material/AppBar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { fetchBooks, formatAuthor, getBookCover, type Book } from "../api/client";
import { useCart } from "./CartContext";

const NAV_LINKS = [
  { label: "Browse", hasArrow: true },
  { label: "New Arrivals", hasArrow: false },
  { label: "Best Sellers", hasArrow: false },
  { label: "Deals", hasArrow: false },
  { label: "Gift Cards", hasArrow: false },
  { label: "Authors", hasArrow: true },
  { label: "Book Clubs", hasArrow: false },
];

export default function AppHeader() {
  const { cartCount, wishlistCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Book[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q")?.trim() ?? "";
    setQuery(q);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    const value = query.trim();
    if (!value) {
      setMatches([]);
      setSearching(false);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetchBooks(value, 1, 10);
        if (cancelled) return;
        setMatches(res.books);
      } catch {
        if (cancelled) return;
        setMatches([]);
      } finally {
        if (!cancelled) {
          setSearching(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    const next = new URLSearchParams();
    if (value) next.set("q", value);
    navigate(
      {
        pathname: "/",
        search: next.toString() ? `?${next.toString()}` : "",
      },
      { replace: location.pathname === "/" }
    );
    setShowDropdown(false);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="xl">
        {/* Main toolbar row */}
        <Toolbar disableGutters sx={{ py: 1, gap: 2, minHeight: "unset" }}>
          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AutoStoriesIcon sx={{ color: "#fff", fontSize: 22 }} />
            </Box>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography
                variant="h6"
                sx={{ color: "text.primary", fontWeight: 700, letterSpacing: 0.2, lineHeight: 1.1 }}
              >
                BookSense
              </Typography>
            </Box>
          </Box>

          {/* Search bar */}
          <Box
            component="form"
            onSubmit={submitSearch}
            sx={{ flex: 1, position: "relative" }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => {
              window.setTimeout(() => setShowDropdown(false), 120);
            }}
          >
            <OutlinedInput
              placeholder="Search books, authors, ISBNs..."
              fullWidth
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                </InputAdornment>
              }
              endAdornment={
                searching ? (
                  <InputAdornment position="end">
                    <CircularProgress size={16} />
                  </InputAdornment>
                ) : undefined
              }
              sx={{
                height: 40,
                borderRadius: 20,
                fontSize: "0.875rem",
                background: "background.default",
              }}
            />
            {showDropdown && query.trim() && (
              <Paper
                elevation={6}
                sx={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  right: 0,
                  zIndex: 40,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                {matches.length > 0 ? (
                  <Box>
                    <Box
                      sx={{
                        p: 0,
                        display: "grid",
                        gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                        gap: 0,
                        borderLeft: "1px solid",
                        borderTop: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      {matches.map((book) => {
                      const cover = getBookCover(book);
                      return (
                        <Box
                          key={book.asin}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            setShowDropdown(false);
                            navigate(`/books/${encodeURIComponent(book.asin)}`);
                          }}
                          sx={{
                            p: 1,
                            px: "25px",
                            width: "100%",
                            borderRadius: 0,
                            cursor: "pointer",
                            transition: "background-color 120ms ease",
                            borderRight: "1px solid",
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            "&:hover": { background: "action.hover" },
                          }}
                        >
                          {cover ? (
                            <Box
                              component="img"
                              src={cover}
                              alt={book.title ?? "Book cover"}
                              sx={{
                                width: "100%",
                                maxWidth: 84,
                                mx: "auto",
                                aspectRatio: "2 / 3",
                                objectFit: "cover",
                                borderRadius: 0,
                                display: "block",
                                boxShadow: (theme) => theme.shadows[1],
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: "100%",
                                maxWidth: 84,
                                mx: "auto",
                                aspectRatio: "2 / 3",
                                borderRadius: 0,
                                bgcolor: "action.selected",
                                color: "text.secondary",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <MenuBookIcon sx={{ fontSize: 16 }} />
                            </Box>
                          )}
                          <Box sx={{ minWidth: 0, mt: 0.75 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 700,
                                color: "text.primary",
                                lineHeight: 1.2,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                fontSize: "0.78rem",
                              }}
                            >
                              {book.title ?? "Untitled"}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                                display: "block",
                                lineHeight: 1.3,
                                mt: 0.25,
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                                fontSize: "0.68rem",
                              }}
                            >
                              {formatAuthor(book.author)}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                    </Box>
                    <Box
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        const next = new URLSearchParams();
                        next.set("q", query.trim());
                        navigate({ pathname: "/", search: `?${next.toString()}` });
                        setShowDropdown(false);
                      }}
                      sx={{
                        px: 1.75,
                        py: 1.1,
                        cursor: "pointer",
                        color: "primary.light",
                        fontWeight: 600,
                        fontSize: "0.82rem",
                        "&:hover": { background: "action.hover" },
                      }}
                    >
                      View all results for "{query.trim()}"
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ px: 1.75, py: 1.4 }}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      No matches found.
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}
          </Box>

          {/* Action icons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
            <IconButton sx={{ color: "text.secondary", "&:hover": { color: "#f87171" } }}>
              <Badge badgeContent={wishlistCount || undefined} color="error" max={9}>
                <FavoriteBorderIcon fontSize="small" />
              </Badge>
            </IconButton>
            <IconButton sx={{ color: "text.secondary", "&:hover": { color: "primary.light" } }}>
              <Badge badgeContent={cartCount || undefined} color="primary" max={99}>
                <ShoppingCartOutlinedIcon fontSize="small" />
              </Badge>
            </IconButton>
            <IconButton sx={{ color: "text.secondary", "&:hover": { color: "primary.light" } }}>
              <PersonOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        </Toolbar>

        {/* Navigation links row */}
        <Box
          sx={{
            display: "flex",
            gap: 0,
            pb: 0.75,
            borderTop: "1px solid",
            borderColor: "divider",
            overflowX: "auto",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {NAV_LINKS.map((link) => (
            <Button
              key={link.label}
              size="small"
              endIcon={
                link.hasArrow ? (
                  <KeyboardArrowDownIcon sx={{ fontSize: "14px !important" }} />
                ) : undefined
              }
              sx={{
                color: "text.secondary",
                fontWeight: 500,
                fontSize: "0.8rem",
                px: 1.5,
                py: 0.75,
                borderRadius: 1.5,
                whiteSpace: "nowrap",
                "&:hover": {
                  color: "primary.light",
                  background: "action.hover",
                },
              }}
            >
              {link.label}
            </Button>
          ))}
        </Box>
      </Container>
    </AppBar>
  );
}
