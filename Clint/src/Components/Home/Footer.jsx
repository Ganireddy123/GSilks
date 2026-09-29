import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";

const COLORS = {
  bg: "#3A0F17", // deep wine/maroon
  gold: "#C9A227",
  goldLight: "#D9BE6B",
  ivory: "#F7F0E4",
  ivoryMuted: "rgba(247,240,228,0.7)",
  border: "rgba(247,240,228,0.25)",
};

const FOOTER_COLUMNS = [
  {
    heading: "SHOP",
    links: [
      { label: "All Sarees", to: "/sarees" },
      { label: "Collections", to: "/collections" },
      { label: "New Arrivals", to: "/new-arrivals" },
      { label: "Wishlist", to: "/wishlist" },
    ],
  },
  {
    heading: "SUPPORT",
    links: [
      { label: "Contact", to: "/#contact" },
      { label: "Shipping", to: "/shipping" },
      { label: "Returns", to: "/returns" },
      { label: "My Orders", to: "/orders" },
    ],
  },
  {
    heading: "GSILKS",
    links: [
      { label: "About", to: "/#about" },
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
      { label: "Admin", to: "/admin/login" },
    ],
  },
];

export default function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (!email.trim()) return;
    // TODO: wire up to your subscribe API
    console.log("Subscribe:", email);
  };

  return (
    <Box id="contact" sx={{ bgcolor: COLORS.bg, color: COLORS.ivory, scrollMarginTop: 88 }}>
      {/* Newsletter */}
      <Box
        sx={{
          textAlign: "center",
          pt: { xs: 6, md: 9 },
          pb: { xs: 6, md: 8 },
          px: 3,
        }}
      >
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.22em",
            color: COLORS.gold,
            mb: 2,
          }}
        >
          THE GSILKS LETTER
        </Typography>

        <Typography
          component="h2"
          sx={{
            fontFamily: "var(--font-heading, Georgia, 'Times New Roman', serif)",
            fontSize: { xs: 34, sm: 42, md: 48 },
            color: "#F7F0E4",
            mb: 2,
          }}
        >
          First look at new weaves
        </Typography>

        <Typography
          sx={{
            color: COLORS.ivoryMuted,
            fontSize: { xs: 14.5, md: 16 },
            mb: 4,
          }}
        >
          Early access to festive and bridal edits. No noise — only beautiful things.
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "center",
            gap: 1.5,
            maxWidth: 620,
            mx: "auto",
          }}
        >
          <TextField
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                color: COLORS.ivory,
                bgcolor: "transparent",
                "& fieldset": { borderColor: COLORS.border },
                "&:hover fieldset": { borderColor: COLORS.goldLight },
                "&.Mui-focused fieldset": { borderColor: COLORS.gold },
              },
              "& .MuiInputBase-input::placeholder": {
                color: "rgba(247,240,228,0.5)",
                opacity: 1,
              },
            }}
          />
          <Button
            onClick={handleSubscribe}
            variant="contained"
            disableElevation
            sx={{
              bgcolor: COLORS.gold,
              color: "#2B1608",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.1em",
              px: 4,
              borderRadius: 0.5,
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: COLORS.goldLight },
            }}
          >
            SUBSCRIBE
          </Button>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          borderTop: `1px solid ${COLORS.border}`,
          pt: { xs: 6, md: 8 },
          pb: 6,
          px: { xs: 3, md: 10 },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              sm: "minmax(280px, 2fr) repeat(3, minmax(100px, 1fr))",
            },
            columnGap: { xs: 3, md: 4 },
            rowGap: { xs: 5, md: 4 },
            maxWidth: 820,
          }}
        >
          {/* Brand column */}
          <Box sx={{ gridColumn: { xs: "1 / -1", sm: "auto" } }}>
            <Typography
              sx={{
                fontFamily: "var(--font-heading, Georgia, 'Times New Roman', serif)",
                fontSize: 28,
                mb: 2,
              }}
            >
              G
              <Box component="span" sx={{ fontStyle: "italic", color: COLORS.goldLight }}>
                S
              </Box>
              ilks
            </Typography>

            <Typography
              sx={{
                color: COLORS.ivoryMuted,
                fontSize: 14.5,
                lineHeight: 1.7,
                maxWidth: 320,
                mb: 3,
              }}
            >
              Handwoven silk sarees from India's great weaving towns — chosen
              for brides, mothers and every treasured moment.
            </Typography>

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <IconButton
                aria-label="Instagram"
                component="a"
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  width: 40,
                  height: 40,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.ivory,
                  "&:hover": { borderColor: COLORS.goldLight, color: COLORS.goldLight },
                }}
              >
                <InstagramIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton
                aria-label="Facebook"
                component="a"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  width: 40,
                  height: 40,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.ivory,
                  "&:hover": { borderColor: COLORS.goldLight, color: COLORS.goldLight },
                }}
              >
                <FacebookIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <Box key={col.heading}
              sx={{
                ml: { xs: 0, sm: 2 , md: 44 },
              }}>
              <Typography
                sx={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  color: COLORS.gold,
                  mb: 2.5,
                }}
              >
                {col.heading}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {col.links.map((link) => (
                  <Typography
                    key={link.to}
                    component={RouterLink}
                    to={link.to}
                    sx={{
                      fontSize: 14.5,
                      color: COLORS.ivory,
                      textDecoration: "none",
                      "&:hover": { color: COLORS.goldLight },
                    }}
                  >
                    {link.label}
                  </Typography>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}