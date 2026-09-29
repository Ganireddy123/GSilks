import React from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const COLORS = { bg: "#F7F3EC", maroon: "#7A1F2B", gold: "#C9A227", ink: "#2B2620" };
const headingFont = "var(--font-heading, Georgia, 'Times New Roman', serif)";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 3,
      }}
    >
      <Typography sx={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.2em", color: COLORS.gold, mb: 2 }}>
        404
      </Typography>
      <Typography component="h1" sx={{ fontFamily: headingFont, color: COLORS.maroon, fontSize: 44, mb: 2 }}>
        Page not found
      </Typography>
      <Typography sx={{ color: "rgba(43,38,32,0.7)", fontSize: 16, mb: 4, maxWidth: 420 }}>
        The page you're looking for doesn't exist or may have moved.
      </Typography>
      <Button
        component={RouterLink}
        to="/"
        variant="contained"
        disableElevation
        sx={{ bgcolor: "#5C1620", px: 4, py: 1.3, borderRadius: 0.5, "&:hover": { bgcolor: COLORS.maroon } }}
      >
        Back to home
      </Button>
    </Box>
  );
}