import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { replaceAdminOrder, setAdminError, setAdminLoading, setAdminResource } from "../State/slices/adminSlice";
import AppAPI from "../API";

/* ---------- design tokens (from the screenshot) ---------- */
const PAGE_BG = "#eee9de";
const INK = "#1c1917";
const BODY = "#44403c";
const MUTED = "#a8a29e";
const BORDER = "#ece8e1";
const GOLD = "#b8893c";
const FONT = '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif';
const SERIF = '"Lora", "Playfair Display", Georgia, "Times New Roman", serif';
const MONO = '"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace';
const RECENT_DAYS = 7;

const statuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

const STATUS_STYLES = {
  PENDING: { label: "Pending", color: "#b45309", bg: "#fde9b0" },
  CONFIRMED: { label: "Processing", color: "#1d4ed8", bg: "#dbe8fd" },
  SHIPPED: { label: "Shipped", color: "#4338ca", bg: "#e3e5fc" },
  DELIVERED: { label: "Delivered", color: "#047857", bg: "#d3f5e4" },
  CANCELLED: { label: "Cancelled", color: "#b91c1c", bg: "#fde0e0" },
};

const AVATAR_COLORS = ["#5b8ede", "#c73e4a", "#3fa66b", "#8b5cf6", "#e09a1a", "#0e94b3"];

const fetchOrders = (dispatch) => {
  dispatch(setAdminLoading(true));
  try {
    AppAPI.adminGetOrders.get()
      .then((result) => dispatch(setAdminResource({ resource: "orders", items: result.data?.orders || [] })))
      .catch((e) => dispatch(setAdminError(e.message)));
  } catch (err) {
    dispatch(setAdminError(err.message));
  }
};

/* ---------- helpers ---------- */
const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("") || "?";

const avatarColor = (name = "") => {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

const productLabel = (o) =>
  o.product_name ||
  o.product ||
  (Array.isArray(o.items) && o.items.map((i) => i.product_name || i.name).filter(Boolean).join(", ")) ||
  "—";

const formatDate = (value) => {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

/* ---------- icons ---------- */
const iconProps = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
const CartIcon = () => (
  <svg {...iconProps}><circle cx="9" cy="20" r="1.3" /><circle cx="18" cy="20" r="1.3" /><path d="M2 3h3l2.6 12.2a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.1L21 8H6" /></svg>
);
const ClockIcon = () => (
  <svg {...iconProps}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
const CheckIcon = () => (
  <svg {...iconProps}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
const HourglassIcon = () => (
  <svg {...iconProps}><path d="M6 3h12M6 21h12M7 3v3.5c0 1.6 1 3 2.6 4L12 12l2.4-1.5c1.6-1 2.6-2.4 2.6-4V3M7 21v-3.5c0-1.6 1-3 2.6-4L12 12l2.4 1.5c1.6 1 2.6 2.4 2.6 4V21" /></svg>
);
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
);

/* ---------- pieces ---------- */
const cardShadow = "0 1px 2px rgba(60,40,10,0.06), 0 4px 14px rgba(60,40,10,0.07)";

function StatCard({ label, value, icon, color, tint }) {
  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: "16px", boxShadow: cardShadow, p: "24px 26px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", minHeight: 110 }}>
      <Box>
        <Typography sx={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: MUTED }}>
          {label}
        </Typography>
        <Typography sx={{ fontFamily: FONT, fontSize: 40, fontWeight: 700, color: INK, lineHeight: 1.15, mt: "2px" }}>
          {value}
        </Typography>
      </Box>
      <Box sx={{ width: 50, height: 50, borderRadius: "12px", bgcolor: tint, color, display: "grid", placeItems: "center", flexShrink: 0 }}>
        {icon}
      </Box>
    </Box>
  );
}

/* The status pill is a real <select>, so admins can still change an order's status. */
function StatusSelect({ order, onChange }) {
  const s = STATUS_STYLES[order.order_status] || { label: order.order_status, color: "#57534e", bg: "#eeeae4" };
  return (
    <Box
      component="select"
      value={order.order_status}
      onChange={(e) => onChange(order.id, e.target.value)}
      aria-label={`Status for ${order.order_number}`}
      sx={{
        appearance: "none",
        WebkitAppearance: "none",
        border: 0,
        outline: "none",
        cursor: "pointer",
        textAlign: "center",
        textAlignLast: "center",
        fontFamily: FONT,
        fontSize: 15,
        fontWeight: 500,
        color: s.color,
        bgcolor: s.bg,
        borderRadius: "999px",
        height: 30,
        px: "14px",
        width: `calc(${s.label.length}ch + 34px)`,
        "&:focus-visible": { boxShadow: `0 0 0 2px ${GOLD}` },
      }}
    >
      {statuses.map((st) => (
        <option key={st} value={st}>{STATUS_STYLES[st]?.label || st}</option>
      ))}
    </Box>
  );
}

const headCellSx = {
  fontFamily: FONT, fontSize: 14, fontWeight: 600, letterSpacing: "0.03em",
  textTransform: "uppercase", color: MUTED, textAlign: "left", py: "16px", px: 0,
};
const cellSx = { py: "20px", px: 0, verticalAlign: "middle" };

/* ---------- page ---------- */
export default function AdminOrders() {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.admin);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => { fetchOrders(dispatch); }, [dispatch]);

  const updateStatus = (id, status) => {
    try {
      AppAPI.adminUpdateOrderStatus.put(undefined, { id, status })
        .then((result) => dispatch(replaceAdminOrder(result.data?.order)))
        .catch((e) => dispatch(setAdminError(e.message)));
    } catch (err) {
      dispatch(setAdminError(err.message));
    }
  };

  const isRecent = (o) => {
    const t = new Date(o.created_at).getTime();
    return Number.isFinite(t) && Date.now() - t <= RECENT_DAYS * 24 * 60 * 60 * 1000;
  };

  const counts = useMemo(() => ({
    all: orders.length,
    recent: orders.filter(isRecent).length,
    delivered: orders.filter((o) => o.order_status === "DELIVERED").length,
    pending: orders.filter((o) => o.order_status === "PENDING").length,
  }), [orders]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (tab === "recent" && !isRecent(o)) return false;
      if (tab === "delivered" && o.order_status !== "DELIVERED") return false;
      if (tab === "pending" && o.order_status !== "PENDING") return false;
      if (!q) return true;
      return [o.order_number, o.customer_name, o.customer_email, productLabel(o)]
        .some((v) => String(v || "").toLowerCase().includes(q));
    });
  }, [orders, tab, query]);

  const tabs = [
    { key: "all", label: "All Orders" },
    { key: "recent", label: "Recent" },
    { key: "delivered", label: "Delivered" },
    { key: "pending", label: "Pending", badge: counts.pending },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4.5 }, bgcolor: PAGE_BG, minHeight: "100%", fontFamily: FONT }}>
      <Typography component="h1" sx={{ fontFamily: SERIF, fontSize: { xs: 32, md: 40 }, fontWeight: 700, color: INK, lineHeight: 1.2, mb: "28px" }}>
        Orders
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* stat cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }, gap: "20px", mb: "40px" }}>
        <StatCard label="Total Orders" value={counts.all} icon={<CartIcon />} color="#d4b189" tint="#fdf3e8" />
        <StatCard label="Recent Orders" value={counts.recent} icon={<ClockIcon />} color="#5b8ede" tint="#e9f0fb" />
        <StatCard label="Delivered" value={counts.delivered} icon={<CheckIcon />} color="#3fa66b" tint="#e8f5ee" />
        <StatCard label="Pending" value={counts.pending} icon={<HourglassIcon />} color="#e09a1a" tint="#fdf1d6" />
      </Box>

      {/* orders panel */}
      <Box sx={{ bgcolor: "#fff", borderRadius: "16px", boxShadow: cardShadow, overflow: "hidden" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 2, flexWrap: "wrap", px: "30px", pt: "24px", borderBottom: `1px solid ${BORDER}` }}>
          <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap" }} role="tablist">
            {tabs.map((t) => {
              const active = tab === t.key;
              return (
                <Box
                  key={t.key}
                  component="button"
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.key)}
                  sx={{
                    display: "inline-flex", alignItems: "center", gap: "8px", px: "20px", pb: "16px", pt: "4px",
                    bgcolor: "transparent", border: 0, cursor: "pointer", fontFamily: FONT, fontSize: 17, fontWeight: 500,
                    color: active ? GOLD : "#78716c",
                    borderBottom: `2px solid ${active ? GOLD : "transparent"}`, mb: "-1px",
                    "&:hover": { color: GOLD },
                  }}
                >
                  {t.label}
                  {t.badge > 0 && (
                    <Box component="span" sx={{ minWidth: 24, height: 24, px: "8px", borderRadius: "999px", bgcolor: "#fde9b0", color: "#b45309", fontSize: 14, fontWeight: 600, display: "inline-grid", placeItems: "center" }}>
                      {t.badge}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>

          <Box sx={{ position: "relative", mb: "14px", width: { xs: "100%", sm: 260 } }}>
            <Box sx={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: MUTED, display: "flex", pointerEvents: "none" }}>
              <SearchIcon />
            </Box>
            <Box
              component="input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search orders..."
              aria-label="Search orders"
              sx={{
                width: "100%", boxSizing: "border-box", height: 42, pl: "42px", pr: "14px", fontFamily: FONT, fontSize: 16,
                color: INK, bgcolor: "#faf9f7", border: `1px solid #e7e2da`, borderRadius: "10px", outline: "none",
                "&::placeholder": { color: "#a8a29e" }, "&:focus": { borderColor: GOLD },
              }}
            />
          </Box>
        </Box>

        <Box sx={{ overflowX: "auto" }}>
          <Box component="table" sx={{ width: "100%", minWidth: 860, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Order ID", "Customer", "Product", "Amount", "Status", "Date"].map((h, i) => (
                  <Box component="th" key={h} sx={{ ...headCellSx, pl: i === 0 ? "30px" : 0, pr: i === 5 ? "30px" : 0 }}>{h}</Box>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <Box component="tr" key={o.id} sx={{ borderTop: `1px solid ${BORDER}`, "&:hover": { bgcolor: "#fdfcfa" } }}>
                  <Box component="td" sx={{ ...cellSx, pl: "30px", fontFamily: MONO, fontSize: 14, color: "#78716c" }}>
                    #{String(o.order_number || o.id).replace(/^#/, "")}
                  </Box>
                  <Box component="td" sx={cellSx}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <Box sx={{ width: 35, height: 35, borderRadius: "50%", bgcolor: avatarColor(o.customer_name), color: "#fff", display: "grid", placeItems: "center", fontFamily: FONT, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                        {initials(o.customer_name)}
                      </Box>
                      <Typography title={o.customer_email} sx={{ fontFamily: FONT, fontSize: 17, fontWeight: 500, color: "#292524" }}>
                        {o.customer_name}
                      </Typography>
                    </Box>
                  </Box>
                  <Box component="td" sx={{ ...cellSx, fontFamily: FONT, fontSize: 17, color: BODY }}>{productLabel(o)}</Box>
                  <Box component="td" title={o.payment_status ? `Payment: ${o.payment_status}` : undefined} sx={{ ...cellSx, fontFamily: FONT, fontSize: 17, fontWeight: 700, color: INK }}>
                    {inr(o.total_amount)}
                  </Box>
                  <Box component="td" sx={cellSx}><StatusSelect order={o} onChange={updateStatus} /></Box>
                  <Box component="td" sx={{ ...cellSx, pr: "30px", fontFamily: FONT, fontSize: 16, color: MUTED, whiteSpace: "nowrap" }}>
                    {formatDate(o.created_at)}
                  </Box>
                </Box>
              ))}
            </tbody>
          </Box>
        </Box>

        {!rows.length && (
          <Typography sx={{ fontFamily: FONT, color: MUTED, textAlign: "center", py: 7, borderTop: `1px solid ${BORDER}` }}>
            {loading && !orders.length ? "Loading orders..." : orders.length ? "No orders match this view." : "No orders yet."}
          </Typography>
        )}
      </Box>
    </Box>
  );
}