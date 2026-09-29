import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import AppAPI from "../API";

/* ---------- design tokens (taken from the screenshots) ---------- */
const BRAND = "#8b0000";
const INK = "#0f172a";
const MUTED = "#94a3b8";
const BORDER = "#e2e8f0";
const PAGE_BG = "#f8fafc";
const FONT = '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif';

const cardSx = {
  bgcolor: "#fff",
  border: `1px solid ${BORDER}`,
  borderRadius: "16px",
};

const STATUS_STYLES = {
  DELIVERED: { color: "#16a34a", bg: "#f0fdf4" },
  PENDING: { color: "#ca8a04", bg: "#fefce8" },
  SHIPPED: { color: "#2563eb", bg: "#eff6ff" },
  CONFIRMED: { color: "#059669", bg: "#ecfdf5" },
  CANCELLED: { color: "#64748b", bg: "#f1f5f9" },
};

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

/* ---------- stat card ---------- */
function StatCard({ label, value, hint, accent, tint }) {
  return (
    <Box sx={{ ...cardSx, p: "24px 28px", position: "relative", minHeight: 156 }}>
      <Typography sx={{ fontFamily: FONT, fontSize: 15, color: "#8b95a7", fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography
        sx={{ fontFamily: FONT, fontSize: 44, fontWeight: 700, color: INK, lineHeight: 1.15, mt: 0.5 }}
      >
        {value}
      </Typography>
      <Typography sx={{ fontFamily: FONT, fontSize: 14, color: MUTED, mt: 0.5 }}>{hint}</Typography>
      <Box
        sx={{
          position: "absolute",
          top: 24,
          right: 24,
          width: 44,
          height: 44,
          borderRadius: "12px",
          bgcolor: tint,
          display: "grid",
          placeItems: "center",
        }}
      >
        <Box sx={{ width: 14, height: 14, borderRadius: "3px", bgcolor: accent }} />
      </Box>
    </Box>
  );
}

/* ---------- smooth line chart (pure SVG, no extra deps) ---------- */
function smoothPath(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function RevenueChart({ data }) {
  const W = 1000, H = 300;
  const pad = { l: 62, r: 14, t: 16, b: 34 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const maxVal = Math.max(...data.map((d) => d.revenue), 1);
  const step = Math.max(1000, Math.ceil(maxVal / 4 / 1000) * 1000);
  const top = step * 4;
  const ticks = [0, 1, 2, 3, 4].map((i) => i * step);

  const pts = data.map((d, i) => ({
    x: pad.l + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW),
    y: pad.t + innerH - (d.revenue / top) * innerH,
  }));

  const line = smoothPath(pts);
  const area = pts.length > 1
    ? `${line} L ${pts[pts.length - 1].x} ${pad.t + innerH} L ${pts[0].x} ${pad.t + innerH} Z`
    : "";

  return (
    <Box component="svg" viewBox={`0 0 ${W} ${H}`} sx={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BRAND} stopOpacity="0.08" />
          <stop offset="100%" stopColor={BRAND} stopOpacity="0" />
        </linearGradient>
      </defs>

      {ticks.map((t) => {
        const y = pad.t + innerH - (t / top) * innerH;
        return (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 5" opacity="0.7" />
            <text x={pad.l - 12} y={y + 4} textAnchor="end" fontSize="14" fill={MUTED} fontFamily={FONT}>
              {`₹${t / 1000}k`}
            </text>
          </g>
        );
      })}

      {area && <path d={area} fill="url(#revFill)" />}
      <path d={line} fill="none" stroke={BRAND} strokeWidth="2.5" strokeLinecap="round" />

      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4.5" fill={BRAND} stroke="#5c0000" strokeWidth="1.5" />
      ))}

      {data.map((d, i) => (
        <text
          key={d.label + i}
          x={pts[i].x}
          y={H - 8}
          textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
          fontSize="14"
          fill={MUTED}
          fontFamily={FONT}
        >
          {d.label}
        </text>
      ))}
    </Box>
  );
}

/* ---------- status pill ---------- */
function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || { color: "#64748b", bg: "#f1f5f9" };
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        px: "12px",
        py: "4px",
        borderRadius: "999px",
        bgcolor: s.bg,
        color: s.color,
        fontFamily: FONT,
        fontSize: 13.5,
        fontWeight: 500,
      }}
    >
      <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: s.color }} />
      {status}
    </Box>
  );
}

/* ---------- page ---------- */
export default function AdminDashboard() {
  const token = useSelector((state) => state.auth.token);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [range, setRange] = useState(6);

  useEffect(() => {
    let active = true;
    try {
      AppAPI.adminDashboard.get()
        .then((result) => {
          if (active) setDashboard(result.data?.dashboard);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    } catch (err) {
      Promise.resolve().then(() => {
        if (active) setError(err.message);
      });
    }
    return () => { active = false; };
  }, [token]);

  const d = dashboard || {};
  const totalOrders = Number(d.totalOrders || 0);
  const paidRevenue = Number(d.paidRevenue || 0);
  const totalUsers = Number(d.totalUsers || 0);
  const pendingOrders = Number(d.pendingOrders || 0);
  const outOfStock = Number(d.outOfStockProducts || 0);

  const stats = [
    { label: "Total Orders", value: totalOrders, hint: totalOrders ? "All time" : "No orders yet", accent: BRAND, tint: "#fff1f2" },
    { label: "Paid Revenue", value: inr(paidRevenue), hint: paidRevenue ? "Paid orders" : "No revenue yet", accent: "#2563eb", tint: "#eff6ff" },
    { label: "Customers", value: totalUsers, hint: `${totalUsers} registered`, accent: "#059669", tint: "#f0fdf4" },
    { label: "Active Products", value: d.totalProducts ?? 0, hint: "In catalogue", accent: "#d97706", tint: "#fffbeb" },
    { label: "Pending Orders", value: pendingOrders, hint: pendingOrders ? "Needs attention" : "All clear", accent: "#7c3aed", tint: "#faf5ff" },
    { label: "Out of Stock", value: outOfStock, hint: outOfStock ? "Restock soon" : "Fully stocked", accent: "#0891b2", tint: "#ecfeff" },
  ];

  const revenueSeries = useMemo(() => {
    const all = Array.isArray(d.revenueByMonth) ? d.revenueByMonth : [];
    return all.slice(-range);
  }, [d.revenueByMonth, range]);

  const subtitle = useMemo(() => {
    if (d.revenueRangeLabel) return d.revenueRangeLabel;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (revenueSeries.length - 1), 1);
    const fmt = (dt, opts) => dt.toLocaleString("en-US", opts);
    return `${fmt(start, { month: "long" })} – ${fmt(now, { month: "long", year: "numeric" })}`;
  }, [d.revenueRangeLabel, revenueSeries.length]);

  const orders = Array.isArray(d.recentOrders) ? d.recentOrders : [];

  const headCell = {
    fontFamily: FONT,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: MUTED,
    py: "14px",
    px: 0,
    textAlign: "left",
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: PAGE_BG, minHeight: "100%", fontFamily: FONT }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* stat cards */}
      <Grid container spacing={2.5}>
        {stats.map((s) => (
          <Grid key={s.label} size={{ xs: 12, sm: 6, lg: 4 }}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      {/* revenue overview */}
      <Box sx={{ ...cardSx, mt: 3, p: { xs: 2.5, md: "28px 30px" } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography component="h2" sx={{ fontFamily: FONT, fontSize: 18, fontWeight: 600, color: INK }}>
              Revenue Overview
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: 14.5, color: MUTED, mt: 0.5 }}>{subtitle}</Typography>
          </Box>
          <Box
            component="select"
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
            aria-label="Revenue range"
            sx={{
              fontFamily: FONT,
              fontSize: 15,
              color: "#334155",
              bgcolor: "#fff",
              border: `1px solid ${BORDER}`,
              borderRadius: "10px",
              px: "16px",
              py: "9px",
              cursor: "pointer",
              outline: "none",
              "&:focus-visible": { borderColor: BRAND },
            }}
          >
            <option value={3}>Last 3 months</option>
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
          </Box>
        </Box>
        <Box sx={{ mt: 2 }}>
          <RevenueChart data={revenueSeries} />
        </Box>
      </Box>

      {/* recent orders */}
      <Box sx={{ ...cardSx, mt: 3, overflow: "hidden" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: "26px 30px" }}>
          <Typography component="h2" sx={{ fontFamily: FONT, fontSize: 18, fontWeight: 600, color: INK }}>
            Recent Orders
          </Typography>
          <Box
            component="a"
            href="/admin/orders"
            sx={{ fontFamily: FONT, fontSize: 15, fontWeight: 500, color: BRAND, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            View all →
          </Box>
        </Box>

        <Box sx={{ overflowX: "auto" }}>
          <Box component="table" sx={{ width: "100%", minWidth: 640, borderCollapse: "collapse" }}>
            <Box component="thead" sx={{ bgcolor: "#fafafa", borderTop: `1px solid ${BORDER}` }}>
              <tr>
                {["Order ID", "Customer", "Product", "Amount", "Status"].map((h, i) => (
                  <Box component="th" key={h} sx={{ ...headCell, pl: i === 0 ? "30px" : 0 }}>
                    {h}
                  </Box>
                ))}
              </tr>
            </Box>
            <tbody>
              {orders.length ? orders.map((o) => (
                <Box component="tr" key={o.id} sx={{ borderTop: `1px solid #f1f5f9` }}>
                  <Box component="td" sx={{ py: "20px", pl: "30px", fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace', fontSize: 13.5, color: BRAND }}>
                    #{String(o.orderNumber || o.id).replace(/^#/, "")}
                  </Box>
                  <Box component="td" sx={{ fontFamily: FONT, fontSize: 15.5, fontWeight: 600, color: INK }}>{o.customer}</Box>
                  <Box component="td" sx={{ fontFamily: FONT, fontSize: 15.5, color: "#64748b" }}>{o.product || "—"}</Box>
                  <Box component="td" sx={{ fontFamily: FONT, fontSize: 15.5, fontWeight: 700, color: INK }}>{inr(o.amount)}</Box>
                  <Box component="td"><StatusPill status={o.status} /></Box>
                </Box>
              )) : (
                <Box component="tr">
                  <Box component="td" colSpan={5} sx={{ py: 3, textAlign: "center", color: MUTED }}>
                    No orders yet.
                  </Box>
                </Box>
              )}
            </tbody>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}