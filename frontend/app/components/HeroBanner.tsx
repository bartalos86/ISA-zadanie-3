import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import StarIcon from "@mui/icons-material/Star";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

export default function HeroBanner() {
  return (
    <Box
      sx={{
        background: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 8, md: 12 } }}>
        <Box
          sx={{
            maxWidth: 820,
            mx: "auto",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: { xs: 1, md: 1.5 },
          }}
        >
          {/* Summer sale chip */}
          <Chip
            icon={<LocalOfferIcon sx={{ fontSize: "14px !important" }} />}
            label="Summer Sale — Up to 60% Off Selected Titles"
            size="small"
            sx={{
              mb: 3.5,
              background: "transparent",
              color: "secondary.main",
              border: "1px solid",
              borderColor: "divider",
              fontWeight: 600,
              fontSize: "0.72rem",
            }}
          />

          {/* Headline */}
          <Typography
            component="h1"
            sx={{
              fontWeight: 800,
              lineHeight: 1.15,
              mb: 3.5,
              color: "text.primary",
              fontSize: { xs: "2.1rem", sm: "2.8rem", md: "3.1rem" },
            }}
          >
            Millions of books.
            <br />
            <Box component="span" sx={{ color: "primary.light" }}>One destination.</Box>
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: "text.secondary", mb: 4.5, maxWidth: 660, lineHeight: 1.8 }}
          >
            Discover your next great read from over 2 million titles across every genre. Fiction,
            science, history, romance — all with personalized AI recommendations curated just for
            you.
          </Typography>

          {/* CTA buttons */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<MenuBookIcon />}
              sx={{ px: 3.5, py: 1.25, fontWeight: 700, borderRadius: 2, fontSize: "0.9rem" }}
            >
              Browse Catalog
            </Button>
            {/* <Button
              variant="outlined"
              size="large"
              startIcon={<StarIcon />}
              sx={{
                px: 3.5,
                py: 1.25,
                fontWeight: 700,
                borderRadius: 2,
                fontSize: "0.9rem",
                borderColor: "divider",
                color: "primary.light",
              }}
            >
              Best Sellers
            </Button> */}
            <Button
              variant="text"
              size="large"
              sx={{
                px: 2,
                py: 1.25,
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "secondary.main",
              }}
            >
              View Deals →
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
