import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import ComputerIcon from "@mui/icons-material/Computer";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PaletteIcon from "@mui/icons-material/Palette";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import PsychologyIcon from "@mui/icons-material/Psychology";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import type { ComponentType } from "react";

interface Category {
  label: string;
  icon: ComponentType<SvgIconProps>;
  color: string;
  bg: string;
  count: string;
}

const CATEGORIES: Category[] = [
  { label: "Fiction", icon: MenuBookIcon, color: "#a599ff", bg: "rgba(124,106,247,0.1)", count: "420K+" },
  { label: "Sci & Tech", icon: ComputerIcon, color: "#60c8f0", bg: "rgba(96,200,240,0.1)", count: "310K+" },
  { label: "Mystery", icon: SearchIcon, color: "#f0a060", bg: "rgba(240,160,96,0.1)", count: "180K+" },
  { label: "Romance", icon: FavoriteBorderIcon, color: "#f06090", bg: "rgba(240,96,144,0.1)", count: "260K+" },
  { label: "History", icon: AccountBalanceIcon, color: "#a0c860", bg: "rgba(160,200,96,0.1)", count: "140K+" },
  { label: "Self-Help", icon: PsychologyIcon, color: "#60d0c0", bg: "rgba(96,208,192,0.1)", count: "95K+" },
  { label: "Children's", icon: ChildCareIcon, color: "#f0d060", bg: "rgba(240,208,96,0.1)", count: "210K+" },
  { label: "Business", icon: BusinessCenterIcon, color: "#80b0ff", bg: "rgba(128,176,255,0.1)", count: "88K+" },
  { label: "Fantasy", icon: AutoAwesomeIcon, color: "#d080ff", bg: "rgba(208,128,255,0.1)", count: "195K+" },
  { label: "Cooking", icon: RestaurantIcon, color: "#ff9060", bg: "rgba(255,144,96,0.1)", count: "72K+" },
  { label: "Art", icon: PaletteIcon, color: "#ff80b0", bg: "rgba(255,128,176,0.1)", count: "54K+" },
  { label: "Biography", icon: PersonSearchIcon, color: "#80d890", bg: "rgba(128,216,144,0.1)", count: "118K+" },
];

export default function CategoryBrowser() {
  return (
    <Box sx={{ py: 4, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <Container maxWidth="xl">
        <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Browse by Category
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "primary.light", cursor: "pointer", fontWeight: 600, fontSize: "0.78rem" }}
          >
            See all categories →
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(3, 1fr)",
              sm: "repeat(4, 1fr)",
              md: "repeat(6, 1fr)",
              lg: "repeat(12, 1fr)",
            },
            gap: 1.5,
          }}
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <ButtonBase
                key={cat.label}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.75,
                  p: { xs: 1.5, md: 2 },
                  borderRadius: 2,
                  background: cat.bg,
                  border: `1px solid ${cat.color}25`,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: `${cat.color}60`,
                    transform: "translateY(-3px)",
                    boxShadow: `0 8px 24px ${cat.color}18`,
                    background: `${cat.bg}`,
                  },
                }}
              >
                <Icon sx={{ fontSize: { xs: 22, md: 28 }, color: cat.color }} />
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.7rem", textAlign: "center" }}
                >
                  {cat.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: cat.color, fontSize: "0.6rem", fontWeight: 500, opacity: 0.8 }}
                >
                  {cat.count}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
