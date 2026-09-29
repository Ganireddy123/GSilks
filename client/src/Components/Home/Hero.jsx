import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import heroImage from "../../assets/hero.png";

export default function Hero() {
  return (
    <Box
      component="section"
      aria-labelledby="hero-title"
      sx={{
        minHeight: { xs: 580, md: "calc(100svh - 88px)" },
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        px: { xs: 3, sm: 5, lg: 6 },
        py: { xs: 8, md: 10 },
        backgroundColor: "#3d1119",
        backgroundImage: `linear-gradient(90deg, rgba(58, 18, 22, 0.82) 0%, rgba(58, 18, 22, 0.55) 35%, rgba(58, 18, 22, 0.15) 65%, rgba(58, 18, 22, 0) 85%), url("${heroImage}")`,
        backgroundSize: "cover",
        backgroundPosition: { xs: "62% center", md: "center 42%" },
      }}
    >
      <Box sx={{ maxWidth: 780, color: "#fff" }}>
        <Typography
          variant="overline"
          sx={{
            display: "block",
            mb: 2,
            color: "#d5b955",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.22em",
          }}
        >
          The Heritage Edit · 2026
        </Typography>
        <Typography
          id="hero-title"
          component="h1"
          sx={{
            mb: 2.5,
            color: "#fff",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: { xs: 42, sm: 58, md: 76 },
            fontWeight: 400,
            lineHeight: 1.08,
            letterSpacing: 0,
          }}
        >
          Timeless Sarees for{" "}
          <Box
            component="span"
            sx={{
              display: { xs: "inline", md: "block" },
              color: "#d5b955",
              fontStyle: "italic",
            }}
          >
            Grand Moments
          </Box>
        </Typography>
        <Typography
          sx={{
            maxWidth: 570,
            mb: 5,
            color: "rgba(255, 255, 255, 0.86)",
            fontSize: { xs: 16, md: 18 },
            lineHeight: 1.7,
          }}
        >
          Pure silks handwoven in Kanchipuram, Varanasi and beyond, each one a
          story of zari, colour and craft.
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Button
            component="a"
            href="/collections"
            variant="contained"
            sx={{
              minHeight: 58,
              px: 4,
              borderRadius: 0,
              backgroundColor: "#bf913b",
              color: "#261b12",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.12em",
              "&:hover": { backgroundColor: "#d0a34a" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Explore Collection
          </Button>
          <Button
            component="a"
            href="/sarees"
            variant="outlined"
            sx={{
              minHeight: 58,
              px: 4,
              borderRadius: 0,
              borderColor: "rgba(255, 255, 255, 0.55)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.12em",
              "&:hover": {
                borderColor: "#fff",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
              },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Shop Now
          </Button>
        </Box>
      </Box>
    </Box>
  );
}