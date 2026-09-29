import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import AppAPI from "../API";
import { setSession } from "../State/slices/authSlice";

const COLORS = {
  bg: "#F7F3EC",
  panelBg: "#3A0F17",
  maroon: "#7A1F2B",
  maroonDark: "#5C1620",
  gold: "#C9A227",
  goldLight: "#D9BE6B",
  ivory: "#F7F0E4",
  ivoryMuted: "rgba(247,240,228,0.7)",
  ink: "#2B2620",
  inkMuted: "rgba(43,38,32,0.65)",
  border: "rgba(43,38,32,0.15)",
};

const headingFont = "var(--font-heading, Georgia, 'Times New Roman', serif)";

export default function SignUp() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) =>
    setForm((f) => ({
      ...f,
      [field]: field === "agree" ? e.target.checked : e.target.value,
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.fullName.trim() || !form.email.trim() || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!form.agree) {
      setError("Please agree to the Terms and Privacy Policy to continue.");
      return;
    }

    setSubmitting(true);
    try {
      AppAPI.register.post(undefined, {
        name: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      })
        .then((result) => {
          const session = result.data;
          if (!session?.token || !session?.user) throw new Error(result.message || "Registration failed.");
          dispatch(setSession(session));
          navigate("/");
        })
        .catch((err) => setError(err?.message || "Something went wrong. Please try again."))
        .finally(() => setSubmitting(false));
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: COLORS.bg }}>
      <Grid container sx={{ minHeight: "100vh" }}>
        {/* Left branded panel */}
        <Grid
          item
          xs={false}
          md={5}
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "space-between",
            bgcolor: COLORS.panelBg,
            color: COLORS.ivory,
            p: 6,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            component="img"
            src="https://placehold.co/900x1200/2A0A10/3A0F17?text=+"
            alt=""
            aria-hidden="true"
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.5,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(58,15,23,0.75) 0%, rgba(58,15,23,0.92) 100%)",
            }}
          />

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography
              component={RouterLink}
              to="/"
              sx={{
                fontFamily: headingFont,
                fontSize: 32,
                color: COLORS.ivory,
                textDecoration: "none",
              }}
            >
              G
              <Box component="span" sx={{ fontStyle: "italic", color: COLORS.goldLight }}>
                S
              </Box>
              ilks
            </Typography>
          </Box>

          <Box sx={{ position: "relative", zIndex: 1, maxWidth: 380 }}>
            <Typography
              sx={{
                fontFamily: headingFont,
                fontSize: { md: 34, lg: 40 },
                lineHeight: 1.2,
                mb: 2,
              }}
            >
              Begin your own{" "}
              <Box component="span" sx={{ fontStyle: "italic", color: COLORS.goldLight }}>
                lineage
              </Box>{" "}
              of silk
            </Typography>
            <Typography sx={{ color: COLORS.ivoryMuted, fontSize: 15, lineHeight: 1.7 }}>
              Create an account to save your favourites, check out faster and
              get first access to new weaves.
            </Typography>
          </Box>

          <Box sx={{ position: "relative", zIndex: 1 }} />
        </Grid>

        {/* Right form panel */}
        <Grid
          item
          xs={12}
          md={7}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: { xs: 3, sm: 6, md: 8 },
            py: { xs: 6, md: 5 },
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 420 }}>
            <Typography
              component={RouterLink}
              to="/"
              sx={{
                display: { xs: "block", md: "none" },
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
              sx={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.2em",
                color: COLORS.gold,
                mb: 1.5,
              }}
            >
              CREATE ACCOUNT
            </Typography>

            <Typography
              component="h1"
              sx={{
                fontFamily: headingFont,
                color: COLORS.maroon,
                fontSize: { xs: 32, sm: 38 },
                lineHeight: 1.15,
                mb: 1,
              }}
            >
              Join GSilks
            </Typography>

            <Typography sx={{ color: COLORS.inkMuted, fontSize: 15, mb: 4 }}>
              Already have an account?{" "}
              <Box
                component={RouterLink}
                to="/login"
                sx={{ color: COLORS.maroon, fontWeight: 600, textDecoration: "none" }}
              >
                Sign in
              </Box>
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                label="Full name"
                fullWidth
                value={form.fullName}
                onChange={handleChange("fullName")}
                sx={{ mb: 2.5 }}
              />

              <TextField
                label="Email address"
                type="email"
                fullWidth
                value={form.email}
                onChange={handleChange("email")}
                sx={{ mb: 2.5 }}
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                value={form.password}
                onChange={handleChange("password")}
                helperText="At least 8 characters"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((s) => !s)}
                        edge="end"
                        size="small"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2.5 }}
              />

              <TextField
                label="Confirm password"
                type={showPassword ? "text" : "password"}
                fullWidth
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                sx={{ mb: 2.5 }}
              />

              <FormControlLabel
                sx={{ mb: 2, alignItems: "flex-start" }}
                control={
                  <Checkbox
                    checked={form.agree}
                    onChange={handleChange("agree")}
                    sx={{ pt: 0, color: COLORS.border, "&.Mui-checked": { color: COLORS.maroon } }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: 13.5, color: COLORS.inkMuted, pt: 1 }}>
                    I agree to the{" "}
                    <Box component={RouterLink} to="/terms" sx={{ color: COLORS.maroon }}>
                      Terms
                    </Box>{" "}
                    and{" "}
                    <Box component={RouterLink} to="/privacy" sx={{ color: COLORS.maroon }}>
                      Privacy Policy
                    </Box>
                  </Typography>
                }
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disableElevation
                disabled={submitting}
                sx={{
                  bgcolor: COLORS.maroonDark,
                  color: COLORS.ivory,
                  fontSize: 13.5,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  py: 1.4,
                  borderRadius: 0.5,
                  mb: 3,
                  "&:hover": { bgcolor: COLORS.maroon },
                }}
              >
                {submitting ? "Creating account…" : "CREATE ACCOUNT"}
              </Button>

              <Divider sx={{ mb: 3, "&::before, &::after": { borderColor: COLORS.border } }}>
                <Typography sx={{ fontSize: 12.5, color: COLORS.inkMuted, px: 1 }}>
                  OR
                </Typography>
              </Divider>

              <Button
                fullWidth
                variant="outlined"
                sx={{
                  borderColor: COLORS.border,
                  color: COLORS.ink,
                  fontSize: 14,
                  fontWeight: 600,
                  py: 1.3,
                  borderRadius: 0.5,
                  "&:hover": { borderColor: COLORS.ink, bgcolor: "rgba(43,38,32,0.03)" },
                }}
              >
                Continue with Google
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}