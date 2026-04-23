import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import RedditIcon from "@mui/icons-material/Reddit";
import TwitterIcon from "@mui/icons-material/Twitter";
import YouTubeIcon from "@mui/icons-material/YouTube";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

const FOOTER_SECTIONS = [
  {
    title: "Shop",
    links: ["New Arrivals", "Best Sellers", "Award Winners", "Coming Soon", "Gift Cards", "Deals & Sales"],
  },
  {
    title: "Categories",
    links: ["Fiction", "Non-Fiction", "Science & Tech", "Mystery & Thriller", "Romance", "Self-Help"],
  },
  {
    title: "Account",
    links: ["Sign In", "Create Account", "Order History", "Wishlist", "My Reviews", "Recommendations"],
  },
  {
    title: "Services",
    links: ["Book Clubs", "Reading Challenges", "Publisher Partners", "Author Events", "Bulk Orders", "API Access"],
  },
  {
    title: "Help",
    links: ["FAQ", "Shipping Info", "Returns & Refunds", "Track Your Order", "Gift Wrapping", "Accessibility"],
  },
];

const SOCIAL_ICONS = [
  { Icon: TwitterIcon, label: "Twitter" },
  { Icon: FacebookIcon, label: "Facebook" },
  { Icon: InstagramIcon, label: "Instagram" },
  { Icon: YouTubeIcon, label: "YouTube" },
  { Icon: RedditIcon, label: "Reddit" },
];

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        background: "rgba(10,10,18,0.98)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        pt: 5,
        pb: 3,
      }}
    >
      <Container maxWidth="xl">
        {/* Top: logo + tagline */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "9px",
              background: "linear-gradient(135deg, #7c6af7, #5040c8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 12px rgba(124,106,247,0.35)",
            }}
          >
            <AutoStoriesIcon sx={{ color: "#fff", fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ color: "#e6e6f0", fontWeight: 800, lineHeight: 1.1 }}>
              BookSense
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(180,180,220,0.4)", fontSize: "0.65rem" }}>
              Your Literary Universe
            </Typography>
          </Box>
        </Box>

        {/* Link columns */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(5, 1fr)",
            },
            gap: { xs: 3, md: 4 },
            mb: 4,
          }}
        >
          {FOOTER_SECTIONS.map((section) => (
            <Box key={section.title}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "text.primary",
                  display: "block",
                  mb: 1.5,
                  fontSize: "0.68rem",
                }}
              >
                {section.title}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.9 }}>
                {section.links.map((link) => (
                  <Typography
                    key={link}
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.74rem",
                      cursor: "pointer",
                      transition: "color 0.15s",
                      "&:hover": { color: "primary.light" },
                    }}
                  >
                    {link}
                  </Typography>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Bottom row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          {/* Copyright */}
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
            © 2026 BookSense, Inc. All rights reserved.
          </Typography>

          {/* Social icons */}
          <Box sx={{ display: "flex", gap: 0.25 }}>
            {SOCIAL_ICONS.map(({ Icon, label }) => (
              <IconButton
                key={label}
                size="small"
                aria-label={label}
                sx={{
                  color: "text.secondary",
                  "&:hover": { color: "primary.light" },
                }}
              >
                <Icon sx={{ fontSize: 18 }} />
              </IconButton>
            ))}
          </Box>

          {/* Legal links */}
          <Box sx={{ display: "flex", gap: 2 }}>
            {["Privacy Policy", "Terms of Service", "Cookie Settings"].map((link) => (
              <Typography
                key={link}
                variant="caption"
                sx={{
                  color: "text.secondary",
                  cursor: "pointer",
                  fontSize: "0.68rem",
                  "&:hover": { color: "primary.light" },
                }}
              >
                {link}
              </Typography>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
