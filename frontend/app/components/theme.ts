import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#7c6af7",
      light: "#a599ff",
      dark: "#5040c8",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#f0a060",
      light: "#ffcc90",
      dark: "#c07030",
      contrastText: "#120c00",
    },
    background: {
      default: "#09090f",
      paper: "#12121f",
    },
    text: {
      primary: "#e6e6f0",
      secondary: "#7878a8",
    },
    divider: "rgba(255,255,255,0.07)",
    error: {
      main: "#f87171",
    },
    success: {
      main: "#4ade80",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Inter', sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#2a2a45 transparent",
          "&::-webkit-scrollbar": { width: 8 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            background: "#2a2a45",
            borderRadius: 4,
          },
          "&::-webkit-scrollbar-thumb:hover": { background: "#3a3a65" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: "#12121f",
          border: "1px solid rgba(124,106,247,0.1)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          transition: "box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease",
          backgroundImage: "none",
          "&:hover": {
            boxShadow: "0 8px 40px rgba(124,106,247,0.22)",
            transform: "translateY(-4px)",
            borderColor: "rgba(124,106,247,0.32)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #7c6af7, #5040c8)",
          "&:hover": {
            background: "linear-gradient(135deg, #9a8fff, #7c6af7)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          background: "#12121f",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255,255,255,0.05)",
          "&::after": {
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          background: "#1c1c30",
          border: "1px solid rgba(124,106,247,0.2)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(124,106,247,0.25)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(124,106,247,0.5)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#7c6af7",
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "rgba(255,255,255,0.07)",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export default theme;
