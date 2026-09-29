import { Link as RouterLink, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { logoutUser } from "../../State/slices/authSlice";

const NAV_LINKS = [
  { label: "HOME", to: "/", end: true },
  { label: "ABOUT US", to: "/#about" },
  { label: "CONTACT US", to: "/#contact" },
];

const COLORS = {
  bg: "#F6F2EA",
  maroon: "#7A1F2B",
  gold: "#B98A3D",
  text: "#2B2620",
  textMuted: "rgba(43,38,32,0.75)",
  border: "rgba(43,38,32,0.08)",
};

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => Boolean(state.auth.token));
  const role = useSelector((state) => state.auth.user?.role);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          top: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          bgcolor: COLORS.bg,
          color: COLORS.text,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <Toolbar
          sx={{
            minHeight: 88,
            px: { xs: 3, md: 6 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Typography
            component={RouterLink}
            to="/"
            sx={{
              fontFamily: "var(--font-heading, Georgia, 'Times New Roman', serif)",
              fontSize: 28,
              color: COLORS.maroon,
              textDecoration: "none",
              letterSpacing: "0.01em",
            }}
          >
            G
            <Box component="span" sx={{ fontStyle: "italic", color: COLORS.gold }}>
              S
            </Box>
            ilks
          </Typography>

          {/* Center nav links */}
          <Box
            component="nav"
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 4,
            }}
          >
            {NAV_LINKS.map(({ label, to, end }) => (
              <Typography
                key={to}
                component={to === "/" ? NavLink : "a"}
                to={to === "/" ? to : undefined}
                href={to === "/" ? undefined : to}
                end={end}
                sx={{
                  fontSize: 13,
                  letterSpacing: "0.12em",
                  color: COLORS.textMuted,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s ease",
                  "&:hover": { color: COLORS.text },
                  "&.active": { color: COLORS.text, fontWeight: 700 },
                }}
              >
                {label}
              </Typography>
            ))}
          </Box>

          {/* Right icons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton aria-label="Search" sx={{ color: COLORS.text }}>
              <SearchIcon sx={{ fontSize: 21 }} />
            </IconButton>
            <IconButton
              aria-label="Wishlist"
              component={RouterLink}
              to="/wishlist"
              sx={{ color: COLORS.text }}
            >
              <FavoriteBorderIcon sx={{ fontSize: 21 }} />
            </IconButton>
            <IconButton
              aria-label="Cart"
              component={RouterLink}
              to="/cart"
              sx={{ color: COLORS.text }}
            >
              <ShoppingBagOutlinedIcon sx={{ fontSize: 21 }} />
            </IconButton>

            {/* Login / Profile — this is the button that previously did nothing */}
            <IconButton
              aria-label={isLoggedIn ? "Profile" : "Login"}
              component={RouterLink}
              to={isLoggedIn ? (role === "ADMIN" ? "/admin/profile" : "/profile") : "/login"}
              sx={{
                width: "auto",
                gap: 0.75,
                px: { xs: 1, sm: 1.5 },
                borderRadius: 1,
                color: COLORS.text,
              }}
            >
              {isLoggedIn ? (
                <AccountCircleIcon sx={{ fontSize: 21 }} />
              ) : (
                <>
                  <PersonOutlineIcon sx={{ fontSize: 21 }} />
                  <Typography
                    component="span"
                    sx={{
                      display: { xs: "none", sm: "inline" },
                      color: "inherit",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    Login
                  </Typography>
                </>
              )}
            </IconButton>

            {isLoggedIn && (
              <Button
                onClick={handleLogout}
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  color: COLORS.maroon,
                  fontSize: 12.5,
                  fontWeight: 600,
                  textTransform: "none",
                  minWidth: "auto",
                }}
              >
                Logout
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Box aria-hidden="true" sx={{ height: 88, flexShrink: 0 }} />
    </>
  );
}