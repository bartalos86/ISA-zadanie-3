import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
}

export default function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
        gap: 1.5,
        opacity: 0.65,
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "rgba(124,106,247,0.1)",
          border: "1px solid rgba(124,106,247,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "primary.light",
          "& > *": { fontSize: "2rem !important" },
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", maxWidth: 320 }}>
        {subtitle}
      </Typography>
    </Box>
  );
}
