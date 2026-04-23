import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import EmailIcon from "@mui/icons-material/Email";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import { useState } from "react";

const PERKS = [
  "Personalized weekly picks",
  "Early access to new arrivals",
  "Exclusive member discounts",
  "Author Q&A invitations",
];

export default function NewsletterBanner() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <Box
      sx={{
        background:
          "linear-gradient(135deg, rgba(124,106,247,0.1) 0%, rgba(80,64,200,0.05) 50%, rgba(9,9,15,0) 100%)",
        borderTop: "1px solid rgba(124,106,247,0.12)",
        borderBottom: "1px solid rgba(124,106,247,0.12)",
        py: { xs: 5, md: 6 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(124,106,247,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="md" sx={{ position: "relative", textAlign: "center" }}>
        {/* Icon */}
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "rgba(124,106,247,0.12)",
            border: "1px solid rgba(124,106,247,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2.5,
          }}
        >
          <EmailIcon sx={{ color: "primary.light", fontSize: 26 }} />
        </Box>

        {!subscribed ? (
          <>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              Never miss a great book
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mb: 3, maxWidth: 420, mx: "auto", lineHeight: 1.7 }}
            >
              Join 500,000+ readers who get personalized recommendations, exclusive deals, and
              literary news delivered weekly.
            </Typography>

            {/* Perk chips */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                justifyContent: "center",
                mb: 3,
              }}
            >
              {PERKS.map((perk) => (
                <Box
                  key={perk}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 1.25,
                    py: 0.5,
                    borderRadius: 10,
                    background: "rgba(124,106,247,0.08)",
                    border: "1px solid rgba(124,106,247,0.18)",
                  }}
                >
                  <CheckCircleOutlineIcon sx={{ fontSize: 13, color: "primary.light" }} />
                  <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
                    {perk}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Input row */}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                maxWidth: 460,
                mx: "auto",
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <OutlinedInput
                placeholder="Enter your email address"
                fullWidth
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                sx={{ height: 46, fontSize: "0.875rem", borderRadius: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleSubscribe}
                sx={{
                  px: 3.5,
                  height: 46,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              >
                Subscribe Free
              </Button>
            </Box>

            <Typography
              variant="caption"
              sx={{ color: "text.secondary", mt: 1.5, display: "block", fontSize: "0.67rem" }}
            >
              No spam, ever. Unsubscribe with one click. Read our{" "}
              <Box
                component="span"
                sx={{
                  color: "primary.light",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Privacy Policy
              </Box>
              .
            </Typography>
          </>
        ) : (
          <>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(74,222,128,0.12)",
                border: "1px solid rgba(74,222,128,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 28, color: "#4ade80" }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              You're on the list!
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", maxWidth: 380, mx: "auto" }}
            >
              Thanks for subscribing. Expect your first personalized reading digest in your inbox
              shortly.
            </Typography>
          </>
        )}
      </Container>
    </Box>
  );
}
