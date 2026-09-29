import { useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory2";
import AddCircleIcon from "@mui/icons-material/Add";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import StoreIcon from "@mui/icons-material/Store";
import LayersIcon from "@mui/icons-material/Layers";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { logoutUser } from "../../State/slices/authSlice";

const ITEMS = [
  { label: "Dashboard", to: "/admin/dashboard", icon: DashboardIcon },
  { label: "Products", to: "/admin/products", icon: InventoryIcon, end: true },
  { label: "Add Product", to: "/admin/products/add", icon: AddCircleIcon },
  { label: "Orders", to: "/admin/orders", icon: ShoppingCartIcon, end: true },
  { label: "Users", to: "/admin/users", icon: PeopleIcon },
  { label: "Profile", to: "/admin/profile", icon: AccountCircleIcon },
  { label: "Categories", to: "/admin/categories", icon: LayersIcon },
];

// Colors pulled out so both the nav items and the static footer links share them
const COLORS = {
  sidebarBg: "#1F1B16", // swap for your theme's sidebar bg
  sidebarBorder: "rgba(255,255,255,0.08)",
  sidebarFg: "rgba(255,255,255,0.7)",
  sidebarFgHover: "#FFFFFF",
  accentBg: "rgba(255,255,255,0.08)",
  goldLight: "#D4B96A",
  ivory: "#FFFFF0",
};

const navItemSx = (isActive) => ({
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  px: 2,
  height: 44,
  borderRadius: 1,
  fontSize: 14,
  color: isActive ? COLORS.goldLight : COLORS.sidebarFg,
  bgcolor: isActive ? COLORS.accentBg : "transparent",
  "&:hover": {
    color: isActive ? COLORS.goldLight : COLORS.sidebarFgHover,
    bgcolor: isActive ? COLORS.accentBg : "rgba(255,255,255,0.06)",
  },
});

export default function AdminSidebar({ onNavigate }) {
  const dispatch = useDispatch();
  const logout = () => dispatch(logoutUser());

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: COLORS.sidebarBg,
        color: COLORS.sidebarFg,
      }}
    >
      <Box
        sx={{
          px: 3,
          height: 80,
          display: "flex",
          alignItems: "center",
          borderBottom: 1,
          borderColor: COLORS.sidebarBorder,
        }}
      >
        <Typography
          sx={{
            fontFamily: "var(--font-heading, inherit)",
            fontSize: 24,
            letterSpacing: "0.02em",
            color: COLORS.ivory,
          }}
        >
          G<Box component="span" sx={{ fontStyle: "italic", color: COLORS.goldLight }}>S</Box>ilks
        </Typography>
        <Typography
          sx={{
            ml: 1,
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: COLORS.goldLight,
            opacity: 0.7,
          }}
        >
          Studio
        </Typography>
      </Box>

      <List
        component="nav"
        aria-label="Admin"
        sx={{ flex: 1, p: 1.5, overflowY: "auto", "& > *": { mb: 0.5 } }}
      >
        {ITEMS.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            style={{ textDecoration: "none" }}
          >
            {({ isActive }) => (
              <ListItemButton disableGutters sx={navItemSx(isActive)}>
                <ListItemIcon sx={{ minWidth: 0, color: "inherit" }}>
                  <Icon sx={{ fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText primaryTypographyProps={{ fontSize: 14 }}>
                  {label}
                </ListItemText>
              </ListItemButton>
            )}
          </NavLink>
        ))}
      </List>

      <Box
        sx={{
          p: 1.5,
          borderTop: 1,
          borderColor: COLORS.sidebarBorder,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        <NavLink to="/" style={{ textDecoration: "none" }}>
          <ListItemButton disableGutters sx={navItemSx(false)}>
            <ListItemIcon sx={{ minWidth: 0, color: "inherit" }}>
              <StoreIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 14 }}>
              View store
            </ListItemText>
          </ListItemButton>
        </NavLink>

        <ListItemButton
          disableGutters
          onClick={() => logout(false)}
          sx={{ ...navItemSx(false), width: "100%" }}
        >
          <ListItemIcon sx={{ minWidth: 0, color: "inherit" }}>
            <LogoutIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: 14 }}>
            Logout
          </ListItemText>
        </ListItemButton>
      </Box>
    </Box>
  );
}