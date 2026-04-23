import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import StarIcon from "@mui/icons-material/Star";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useCart } from "./CartContext";

interface MockBook {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  category: string;
  badge?: string;
  coverBg: string;
  coverAccent: string;
  initial: string;
}

const MOCK_DEALS: MockBook[] = [
  {
    id: "deal-1",
    title: "The Art of Thinking Clearly",
    author: "Rolf Dobelli",
    price: 7.99,
    originalPrice: 18.99,
    rating: 4.4,
    reviews: 12840,
    category: "Self-Help",
    badge: "BESTSELLER",
    coverBg: "#1a1040",
    coverAccent: "#7c6af7",
    initial: "A",
  },
  {
    id: "deal-2",
    title: "Dune: The Butlerian Jihad",
    author: "Brian Herbert",
    price: 5.99,
    originalPrice: 16.99,
    rating: 4.2,
    reviews: 8320,
    category: "Sci-Fi",
    coverBg: "#1a1000",
    coverAccent: "#f0a060",
    initial: "D",
  },
  {
    id: "deal-3",
    title: "Atomic Habits",
    author: "James Clear",
    price: 10.99,
    originalPrice: 27.0,
    rating: 4.8,
    reviews: 89200,
    category: "Self-Help",
    badge: "#1 BESTSELLER",
    coverBg: "#001a10",
    coverAccent: "#4ade80",
    initial: "A",
  },
  {
    id: "deal-4",
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    price: 6.49,
    originalPrice: 19.99,
    rating: 4.6,
    reviews: 31500,
    category: "Fantasy",
    coverBg: "#100a20",
    coverAccent: "#d080ff",
    initial: "N",
  },
  {
    id: "deal-5",
    title: "Sapiens: A Brief History",
    author: "Yuval Noah Harari",
    price: 9.99,
    originalPrice: 22.99,
    rating: 4.5,
    reviews: 44100,
    category: "History",
    badge: "AWARD WINNER",
    coverBg: "#0a1a10",
    coverAccent: "#a0c860",
    initial: "S",
  },
  {
    id: "deal-6",
    title: "Project Hail Mary",
    author: "Andy Weir",
    price: 8.49,
    originalPrice: 21.0,
    rating: 4.9,
    reviews: 28600,
    category: "Sci-Fi",
    coverBg: "#001020",
    coverAccent: "#60c8f0",
    initial: "P",
  },
  {
    id: "deal-7",
    title: "The Midnight Library",
    author: "Matt Haig",
    price: 7.49,
    originalPrice: 17.99,
    rating: 4.3,
    reviews: 56400,
    category: "Fiction",
    coverBg: "#0a0a1a",
    coverAccent: "#a599ff",
    initial: "M",
  },
  {
    id: "deal-8",
    title: "Deep Work",
    author: "Cal Newport",
    price: 8.99,
    originalPrice: 20.99,
    rating: 4.6,
    reviews: 22100,
    category: "Business",
    coverBg: "#001018",
    coverAccent: "#80b0ff",
    initial: "D",
  },
];

function DealCard({ book }: { book: MockBook }) {
  const { addToCart } = useCart();
  const discount = Math.round((1 - book.price / book.originalPrice) * 100);

  return (
    <Paper
      elevation={0}
      sx={{
        width: 196,
        flexShrink: 0,
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid rgba(124,106,247,0.1)",
        background: "#12121f",
        transition: "all 0.25s ease",
        "&:hover": {
          borderColor: "rgba(124,106,247,0.32)",
          transform: "translateY(-5px)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.55)",
        },
      }}
    >
      {/* Mock cover */}
      <Box
        sx={{
          height: 154,
          background: `linear-gradient(145deg, ${book.coverBg} 0%, #09090f 100%)`,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Glow blob */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${book.coverAccent}30 0%, transparent 70%)`,
          }}
        />
        <Typography
          sx={{
            color: book.coverAccent,
            fontWeight: 900,
            fontSize: "3rem",
            opacity: 0.55,
            zIndex: 1,
            fontFamily: "Georgia, serif",
            lineHeight: 1,
          }}
        >
          {book.initial}
        </Typography>

        {/* Discount badge */}
        <Chip
          label={`-${discount}%`}
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            height: 20,
            background: "rgba(240,80,80,0.92)",
            color: "#fff",
            fontWeight: 800,
            fontSize: "0.62rem",
            "& .MuiChip-label": { px: 0.75 },
          }}
        />

        {/* Category label */}
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            px: 0.75,
            py: 0.25,
            background: `${book.coverAccent}20`,
            border: `1px solid ${book.coverAccent}40`,
            borderRadius: 1,
          }}
        >
          <Typography sx={{ fontSize: "0.57rem", color: book.coverAccent, fontWeight: 700 }}>
            {book.category}
          </Typography>
        </Box>

        {/* Wishlist button */}
        <IconButton
          size="small"
          sx={{
            position: "absolute",
            bottom: 6,
            right: 6,
            color: "text.secondary",
            background: "rgba(9,9,15,0.65)",
            backdropFilter: "blur(4px)",
            "&:hover": { color: "#f87171", background: "rgba(9,9,15,0.85)" },
            width: 28,
            height: 28,
          }}
        >
          <FavoriteBorderIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>

      {/* Info block */}
      <Box sx={{ p: 1.5 }}>
        {book.badge && (
          <Typography
            sx={{
              fontSize: "0.57rem",
              color: "secondary.main",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              mb: 0.25,
            }}
          >
            {book.badge}
          </Typography>
        )}

        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            lineHeight: 1.3,
            mb: 0.25,
            fontSize: "0.8rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {book.title}
        </Typography>

        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
          {book.author}
        </Typography>

        {/* Rating */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
          <StarIcon sx={{ fontSize: 12, color: "secondary.main" }} />
          <Typography variant="caption" sx={{ fontSize: "0.67rem", color: "text.secondary" }}>
            {book.rating} ({book.reviews.toLocaleString()})
          </Typography>
        </Box>

        {/* Price row */}
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75, mt: 0.75, mb: 1.25 }}>
          <Typography sx={{ fontWeight: 800, color: "primary.light", fontSize: "1.05rem" }}>
            ${book.price.toFixed(2)}
          </Typography>
          <Typography
            sx={{ color: "text.secondary", fontSize: "0.72rem", textDecoration: "line-through" }}
          >
            ${book.originalPrice.toFixed(2)}
          </Typography>
        </Box>

        <Button
          size="small"
          variant="contained"
          fullWidth
          startIcon={<AddShoppingCartIcon sx={{ fontSize: "14px !important" }} />}
          onClick={addToCart}
          sx={{
            py: 0.7,
            fontSize: "0.72rem",
            fontWeight: 700,
            background: "linear-gradient(135deg, #7c6af7, #5040c8)",
            "&:hover": { background: "linear-gradient(135deg, #9a8fff, #7c6af7)" },
          }}
        >
          Add to Cart
        </Button>
      </Box>
    </Paper>
  );
}

export default function DealsSection() {
  return (
    <Box sx={{ py: 4, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <Container maxWidth="xl">
        {/* Section header */}
        <Box
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "9px",
                background: "linear-gradient(135deg, #f05050, #c02020)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 14px rgba(240,80,80,0.3)",
              }}
            >
              <LocalOfferIcon sx={{ color: "#fff", fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Today's Deals
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
                Limited time offers — ends at midnight
              </Typography>
            </Box>
          </Box>
          <Button
            size="small"
            sx={{ color: "primary.light", fontWeight: 600, fontSize: "0.8rem" }}
          >
            View all deals →
          </Button>
        </Box>

        {/* Horizontal scroll row */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            pb: 1,
            "&::-webkit-scrollbar": { height: 4 },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": { background: "#2a2a45", borderRadius: 2 },
          }}
        >
          {MOCK_DEALS.map((book) => (
            <DealCard key={book.id} book={book} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
