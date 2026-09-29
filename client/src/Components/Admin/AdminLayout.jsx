import { useState } from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import AdminSidebar from "./AdminSidebar";

const SIDEBAR_WIDTH = 256; // w-64

export default function AdminLayout() {
  const user = useSelector((state) => state.auth.user);
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F6F3EE", display: "flex" }}>
      {/* Permanent sidebar on large screens */}
      {isLgUp && (
        <Box
          component="aside"
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            position: "sticky",
            top: 0,
            height: "100vh",
          }}
        >
          <AdminSidebar />
        </Box>
      )}

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
            border: 0,
            p: 0,
          },
        }}
      >
        <Typography
          component="h2"
          sx={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            whiteSpace: "nowrap",
          }}
        >
          Admin navigation
        </Typography>
        <AdminSidebar onNavigate={() => setOpen(false)} />
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Box
          component="header"
          sx={{
            height: 64,
            bgcolor: "white",
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 2, md: 4 },
            position: "sticky",
            top: 0,
            zIndex: (t) => t.zIndex.appBar,
          }}
        >
          <IconButton
            aria-label="Open admin menu"
            onClick={() => setOpen(true)}
            sx={{ display: { xs: "inline-flex", lg: "none" }, ml: -1 }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: "none", lg: "block" } }}
          >
            Admin Console
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="body2" fontWeight={500} lineHeight={1.2}>
                {user?.name || user?.full_name}
              </Typography>
              <Typography sx={{ fontSize: 11 }} color="text.secondary">
                Administrator
              </Typography>
            </Box>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "maroon",
                color: "#FFFFF0", // ivory
                fontSize: 14,
              }}
            >
              {(user?.name || user?.full_name || "A")[0]}
            </Avatar>
          </Box>
        </Box>

        <Box component="main" sx={{ flex: 1, minWidth: 0, p: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}