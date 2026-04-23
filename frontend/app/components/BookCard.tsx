import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import StarIcon from "@mui/icons-material/Star";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Rating from "@mui/material/Rating";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { Link } from "react-router";
import {
  type Book,
  formatAuthor,
  formatCategories,
  formatDescription,
  getBookCover,
} from "../api/client";
import { useCart } from "./CartContext";

interface BookCardProps {
  book: Book;
  showUserRating?: boolean;
  showAddToCart?: boolean;
}

function CoverImage({ src, title }: { src: string | null; title: string }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <Box
        sx={{
          width: "100%",
          aspectRatio: "2/3",
          background: "linear-gradient(135deg, #1c1830 0%, #12101e 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <MenuBookIcon sx={{ fontSize: 48, color: "primary.light", opacity: 0.5 }} />
        <Typography
          variant="caption"
          sx={{
            color: "primary.light",
            opacity: 0.4,
            textAlign: "center",
            px: 1,
            fontSize: "0.65rem",
            fontWeight: 500,
          }}
        >
          No Cover
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={src}
      alt={title}
      onError={() => setError(true)}
      sx={{
        width: "100%",
        aspectRatio: "2/3",
        objectFit: "cover",
        display: "block",
      }}
    />
  );
}

export default function BookCard({
  book,
  showUserRating = false,
  showAddToCart = true,
}: BookCardProps) {
  const cover = getBookCover(book);
  const author = formatAuthor(book.author);
  const description = formatDescription(book.description);
  const categories = formatCategories(book.categories);
  const title = book.title ?? "Untitled";
  const bookId = book.asin ?? title;
  const detailsAsin = book.asin;

  const { addToCart, toggleWishlist, wishlistItems } = useCart();
  const isWishlisted = wishlistItems.has(bookId);

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Cover image */}
      <Box sx={{ position: "relative", flexShrink: 0 }}>
        <Box component={Link} to={`/books/${encodeURIComponent(detailsAsin)}`} sx={{ display: "block" }}>
          <CoverImage src={cover} title={title} />
        </Box>

        {/* Price badge */}
        {book.price != null && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "rgba(124,106,247,0.88)",
              color: "#fff",
              borderRadius: 1,
              px: 0.75,
              py: 0.25,
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(165,153,255,0.3)",
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.7rem" }}>
              ${book.price.toFixed(2)}
            </Typography>
          </Box>
        )}

        {/* User rating badge */}
        {showUserRating && book.user_rating != null && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              background: "rgba(240,160,96,0.92)",
              color: "#120c00",
              borderRadius: 1,
              px: 0.75,
              py: 0.25,
              display: "flex",
              alignItems: "center",
              gap: 0.25,
              backdropFilter: "blur(6px)",
            }}
          >
            <StarIcon sx={{ fontSize: 12 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.7rem" }}>
              {book.user_rating}
            </Typography>
          </Box>
        )}

        {/* Wishlist button */}
        <IconButton
          size="small"
          onClick={() => toggleWishlist(bookId)}
          sx={{
            position: "absolute",
            bottom: 6,
            right: 6,
            width: 28,
            height: 28,
            background: "rgba(9,9,15,0.65)",
            backdropFilter: "blur(4px)",
            color: isWishlisted ? "#f87171" : "rgba(255,255,255,0.4)",
            border: isWishlisted
              ? "1px solid rgba(248,113,113,0.4)"
              : "1px solid rgba(255,255,255,0.1)",
            transition: "all 0.2s ease",
            "&:hover": {
              color: "#f87171",
              background: "rgba(9,9,15,0.85)",
              borderColor: "rgba(248,113,113,0.5)",
            },
          }}
        >
          {isWishlisted ? (
            <FavoriteIcon sx={{ fontSize: 13 }} />
          ) : (
            <FavoriteBorderIcon sx={{ fontSize: 13 }} />
          )}
        </IconButton>
      </Box>

      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          p: 1.5,
          "&:last-child": { pb: 1.5 },
        }}
      >
        {/* Category */}
        {book.main_category && (
          <Typography
            variant="caption"
            sx={{
              color: "secondary.main",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontSize: "0.6rem",
            }}
          >
            {book.main_category}
          </Typography>
        )}

        {/* Title */}
        <Tooltip title={title} placement="top" enterDelay={600}>
          <Typography
            variant="subtitle2"
            component={Link}
            to={`/books/${encodeURIComponent(detailsAsin)}`}
            sx={{
              fontWeight: 700,
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              color: "text.primary",
              fontSize: "0.82rem",
              textDecoration: "none",
              "&:hover": { color: "primary.light" },
            }}
          >
            {title}
          </Typography>
        </Tooltip>

        {/* Author */}
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontSize: "0.72rem",
          }}
        >
          {author}
        </Typography>

        {/* Average rating */}
        {book.average_rating != null && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
            <Rating
              value={book.average_rating}
              max={5}
              precision={0.1}
              readOnly
              size="small"
              sx={{
                fontSize: "0.75rem",
                "& .MuiRating-iconFilled": { color: "secondary.main" },
                "& .MuiRating-iconEmpty": { color: "rgba(240,160,96,0.2)" },
              }}
            />
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem" }}>
              {book.average_rating.toFixed(1)}
              {book.rating_number != null && ` (${book.rating_number.toLocaleString()})`}
            </Typography>
          </Box>
        )}

        {/* Description */}
        {description && (
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.5,
              mt: 0.5,
              fontSize: "0.7rem",
            }}
          >
            {description}
          </Typography>
        )}

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Categories */}
        {categories.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.4, mt: 0.5 }}>
            {categories.slice(0, 2).map((cat) => (
              <Chip
                key={cat}
                label={cat}
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.6rem",
                  background: "rgba(124,106,247,0.12)",
                  color: "primary.light",
                  border: "1px solid rgba(124,106,247,0.2)",
                  "& .MuiChip-label": { px: 0.75 },
                }}
              />
            ))}
          </Box>
        )}

        {/* Add to cart */}
        {showAddToCart && (
          <Button
            size="small"
            variant="contained"
            fullWidth
            startIcon={<AddShoppingCartIcon sx={{ fontSize: "13px !important" }} />}
            onClick={addToCart}
            sx={{
              mt: 1,
              py: 0.6,
              fontSize: "0.7rem",
              fontWeight: 700,
              background: "linear-gradient(135deg, #7c6af7, #5040c8)",
              "&:hover": { background: "linear-gradient(135deg, #9a8fff, #7c6af7)" },
            }}
          >
            Add to Cart
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
