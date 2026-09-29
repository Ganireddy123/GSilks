import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";

const COLORS = {
  bg: "#F7F3EC",
  maroon: "#7A1F2B",
  maroonDark: "#5C1620",
  gold: "#C9A227",
  ivory: "#F7F0E4",
  ink: "#2B2620",
  inkMuted: "rgba(43,38,32,0.65)",
};
const headingFont = "var(--font-heading, Georgia, 'Times New Roman', serif)";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: call your real password-reset API here
    setSent(true);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: COLORS.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 420 }}>
        <Typography
          component={RouterLink}
          to="/"
          sx={{
            display: "block",
            fontFamily: headingFont,
            fontSize: 28,
            color: COLORS.maroon,
            textDecoration: "none",
            textAlign: "center",
            mb: 5,
          }}
        >
          G
          <Box component="span" sx={{ fontStyle: "italic", color: COLORS.gold }}>
            S
          </Box>
          ilks
        </Typography>

        <Typography
          sx={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: COLORS.gold, mb: 1.5 }}
        >
          RESET PASSWORD
        </Typography>
        <Typography
          component="h1"
          sx={{ fontFamily: headingFont, color: COLORS.maroon, fontSize: 32, mb: 1 }}
        >
          Forgot your password?
        </Typography>
        <Typography sx={{ color: COLORS.inkMuted, fontSize: 15, mb: 4 }}>
          Enter your email and we'll send you a link to reset it.
        </Typography>

        {sent ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            If an account exists for {email}, a reset link is on its way.
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email address"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disableElevation
              sx={{
                bgcolor: COLORS.maroonDark,
                color: COLORS.ivory,
                fontWeight: 700,
                letterSpacing: "0.08em",
                py: 1.4,
                borderRadius: 0.5,
                "&:hover": { bgcolor: COLORS.maroon },
              }}
            >
              SEND RESET LINK
            </Button>
          </Box>
        )}

        <Typography sx={{ mt: 3, textAlign: "center", fontSize: 14 }}>
          <Box component={RouterLink} to="/login" sx={{ color: COLORS.maroon, fontWeight: 600 }}>
            Back to sign in
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}