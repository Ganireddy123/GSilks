import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import Navbar from "../Components/Home/NavBar";
import Footer from "../Components/Home/Footer";
import { setUser } from "../State/slices/authSlice";
import AppAPI, { resolveAssetUrl } from "../API";

/* ---------- design tokens (from the screenshots) ---------- */
const PAGE_BG = "#eee9de";
const INK = "#1f1b16";
const BODY = "#57534e";
const MUTED = "#a09a90";
const LABEL = "#78716c";
const GOLD = "#b8893c";
const MAROON = "#6b0f22";
const BORDER = "#e8e4dc";
const FONT = '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif';
const SERIF = '"Lora", "Playfair Display", Georgia, "Times New Roman", serif';
const cardShadow = "0 1px 2px rgba(60,40,10,0.06), 0 4px 14px rgba(60,40,10,0.07)";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const compactInr = (value) => {
  const n = Number(value || 0);
  if (n >= 1e7) return `₹${+(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${+(n / 1e5).toFixed(1)}L`;
  return inr(n);
};

const roleLabel = (role = "") =>
  String(role).toLowerCase().split(/[_\s]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

const formatUpdated = (value) => {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return "";
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${date} at ${time}`;
};

const inputSx = {
  width: "100%", boxSizing: "border-box", height: 56, px: "20px", fontFamily: FONT, fontSize: 17, color: "#3b3630",
  bgcolor: "#faf9f6", border: `1px solid ${BORDER}`, borderRadius: "14px", outline: "none",
  "&::placeholder": { color: MUTED }, "&:focus": { borderColor: GOLD, bgcolor: "#fff" },
  "&[readonly]": { cursor: "default" },
};

function Field({ label, required, children, full }) {
  return (
    <Box sx={{ gridColumn: full ? { sm: "1 / -1" } : "auto" }}>
      <Typography component="label" sx={{ display: "block", mb: "10px", fontFamily: FONT, fontSize: 14.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: LABEL }}>
        {label}{required && <Box component="span" sx={{ color: "#ef4444", ml: "3px" }}>*</Box>}
      </Typography>
      {children}
    </Box>
  );
}

const primaryBtn = {
  height: 50, px: "30px", border: 0, borderRadius: "12px", bgcolor: MAROON, color: "#fff", fontFamily: FONT, fontSize: 17, fontWeight: 700,
  cursor: "pointer", "&:hover": { bgcolor: "#570c1b" }, "&:disabled": { opacity: 0.6, cursor: "default" },
};

/* ---------- page ---------- */
export default function Profile({ adminOnly = false }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [dash, setDash] = useState(null);
  const [tab, setTab] = useState("personal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const isAdmin = adminOnly;

  /* load the latest profile into the store (same call as before) */
  useEffect(() => {
    try {
      AppAPI.getProfile.get()
        .then((result) => dispatch(setUser(result.data?.user)))
        .catch((e) => setError(e.message));
    } catch (err) {
      Promise.resolve().then(() => setError(err.message));
    }
  }, [dispatch]);

  /* keep the form in sync with the store */
  useEffect(() => {
    if (!user) return;
    setForm({ name: user.name || "", phone: user.phone || "" });
  }, [user?.id, user?.updated_at]); // eslint-disable-line react-hooks/exhaustive-deps

  /* header stats for admins reuse the dashboard endpoint */
  useEffect(() => {
    if (!isAdmin) return undefined;
    let active = true;
    try {
      AppAPI.adminDashboard.get()
        .then((result) => { if (active) setDash(result.data?.dashboard); })
        .catch(() => {});
    } catch { /* stats are optional */ }
    return () => { active = false; };
  }, [isAdmin]);

  const stats = useMemo(() => {
    if (!isAdmin || !dash) return [];
    return [
      { label: "Products", value: Number(dash.totalProducts || 0).toLocaleString("en-IN") },
      { label: "Orders", value: Number(dash.totalOrders || 0).toLocaleString("en-IN") },
      { label: "Revenue", value: compactInr(dash.paidRevenue) },
    ];
  }, [isAdmin, dash]);

  const setField = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const save = (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      AppAPI.updateProfile.put(undefined, {
        name: String(form.name || "").trim(),
        phone: String(form.phone || "").trim(),
      })
        .then((result) => {
          if (!result.data?.profile) throw new Error("The profile update response was incomplete.");
          dispatch(setUser(result.data.profile));
          setToast("Profile updated.");
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const savePassword = (event) => {
    event.preventDefault();
    setError("");
    if (pw.next.length < 8) return setError("New password must be at least 8 characters.");
    if (pw.next !== pw.confirm) return setError("New password and confirmation do not match.");
    setLoading(true);
    try {
      AppAPI.changePassword.put(undefined, { currentPassword: pw.current, newPassword: pw.next })
        .then(() => {
          setPw({ current: "", next: "", confirm: "" });
          setToast("Password updated.");
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const displayName = form.name || user?.name || "Your account";
  const avatarUrl = user?.avatar_url ? resolveAssetUrl(user.avatar_url) : "";
  const activity = Array.isArray(user?.activity) ? user.activity : Array.isArray(user?.recent_activity) ? user.recent_activity : [];
  const updated = formatUpdated(user?.updated_at);

  const tabs = [
    { key: "personal", label: "Personal Info" },
    { key: "security", label: "Security" },
    { key: "activity", label: "Recent Activity" },
  ];

  return (
    <>
      {!adminOnly && <Navbar />}
      <Box sx={{ bgcolor: PAGE_BG, minHeight: adminOnly ? "calc(100vh - 64px)" : "65vh", p: { xs: 2, md: "40px" }, fontFamily: FONT }}>
        <Box sx={{ maxWidth: 1080, mx: "auto" }}>
          <Typography component="h1" sx={{ fontFamily: SERIF, fontSize: { xs: 32, md: 40 }, fontWeight: 700, color: INK, lineHeight: 1.2, mb: "32px" }}>
            {adminOnly ? "Administrator Profile" : "Your Profile"}
          </Typography>

          {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>{error}</Alert>}

          {/* ---------- header card ---------- */}
          <Box sx={{ bgcolor: "#fff", borderRadius: "18px", boxShadow: cardShadow, overflow: "hidden", mb: "30px" }}>
            <Box
              sx={{
                height: 140,
                background:
                  "repeating-linear-gradient(45deg, rgba(255,255,255,0.045) 0 2px, transparent 2px 14px), linear-gradient(100deg, #6b1428 0%, #9b1c2c 42%, #c4a468 100%)",
              }}
            />
            <Box sx={{ px: { xs: 3, md: "40px" }, pb: "32px" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                <Box sx={{ position: "relative", mt: "-50px", width: 100, height: 100 }}>
                  <Box
                    sx={{
                      width: 100, height: 100, borderRadius: "50%", border: "5px solid #fff", boxShadow: "0 4px 14px rgba(60,40,10,0.18)",
                      bgcolor: "#c8404a", color: "#fff", display: "grid", placeItems: "center", overflow: "hidden",
                      fontFamily: FONT, fontSize: 34, fontWeight: 700, boxSizing: "border-box",
                    }}
                  >
                    {avatarUrl
                      ? <Box component="img" src={avatarUrl} alt={displayName} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : (displayName[0] || "?").toUpperCase()}
                  </Box>
                  <Box sx={{ position: "absolute", right: 4, bottom: 6, width: 20, height: 20, borderRadius: "50%", bgcolor: "#10d48e", border: "3px solid #fff" }} aria-label="Online" />
                </Box>

                {stats.length > 0 && (
                  <Box sx={{ display: "flex", gap: { xs: "28px", md: "40px" }, pt: "14px" }}>
                    {stats.map((s) => (
                      <Box key={s.label} sx={{ textAlign: "center" }}>
                        <Typography sx={{ fontFamily: FONT, fontSize: 24, fontWeight: 700, color: INK, lineHeight: 1.2 }}>{s.value}</Typography>
                        <Typography sx={{ fontFamily: FONT, fontSize: 15, color: MUTED }}>{s.label}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", mt: "16px" }}>
                <Typography component="h2" sx={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: INK }}>{displayName}</Typography>
                {user?.role && (
                  <Box sx={{ px: "14px", height: 28, display: "inline-flex", alignItems: "center", borderRadius: "999px", bgcolor: "#c9a96a", color: "#fff", fontFamily: FONT, fontSize: 14, fontWeight: 700 }}>
                    {roleLabel(user.role)}
                  </Box>
                )}
              </Box>
              <Typography sx={{ fontFamily: FONT, fontSize: 17, color: MUTED, mt: "6px" }}>
                {user?.email}
              </Typography>
            </Box>
          </Box>

          {/* ---------- tabs card ---------- */}
          <Box sx={{ bgcolor: "#fff", borderRadius: "18px", boxShadow: cardShadow, overflow: "hidden" }}>
            <Box role="tablist" sx={{ display: "flex", gap: "10px", px: { xs: 1, md: "30px" }, borderBottom: `1px solid ${BORDER}`, overflowX: "auto" }}>
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
                      px: "20px", pt: "26px", pb: "18px", bgcolor: "transparent", border: 0, cursor: "pointer", whiteSpace: "nowrap",
                      fontFamily: FONT, fontSize: 18, fontWeight: 500, color: active ? GOLD : "#a8a29e",
                      borderBottom: `2px solid ${active ? GOLD : "transparent"}`, mb: "-1px", "&:hover": { color: GOLD },
                    }}
                  >
                    {t.label}
                  </Box>
                );
              })}
            </Box>

            {tab === "personal" && (
              <Box component="form" onSubmit={save} sx={{ p: { xs: 3, md: "40px" } }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: "28px 30px" }}>
                  <Field label="Full name" required>
                    <Box component="input" name="name" required value={form.name} onChange={setField("name")} sx={inputSx} />
                  </Field>
                  <Field label="Email address">
                    <Box component="input" type="email" value={user?.email || ""} readOnly sx={inputSx} />
                  </Field>
                  <Field label="Phone number">
                    <Box component="input" name="phone" type="tel" value={form.phone} onChange={setField("phone")} placeholder="+91 90000 00000" sx={inputSx} />
                  </Field>
                  <Field label="Role">
                    <Box component="input" value={roleLabel(user?.role)} readOnly sx={inputSx} />
                  </Field>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap", borderTop: `1px solid ${BORDER}`, mt: "36px", pt: "24px" }}>
                  <Typography sx={{ fontFamily: FONT, fontSize: 15, color: MUTED }}>{updated ? `Last updated: ${updated}` : ""}</Typography>
                  <Box component="button" type="submit" disabled={loading} sx={primaryBtn}>{loading ? "Saving..." : "Save Profile"}</Box>
                </Box>
              </Box>
            )}

            {tab === "security" && (
              <Box component="form" onSubmit={savePassword} sx={{ p: { xs: 3, md: "40px" } }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: "28px 30px" }}>
                  <Field label="Current password" required full>
                    <Box component="input" type="password" required autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} sx={{ ...inputSx, maxWidth: { sm: 480 } }} />
                  </Field>
                  <Field label="New password" required>
                    <Box component="input" type="password" required minLength={8} autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} sx={inputSx} />
                  </Field>
                  <Field label="Confirm new password" required>
                    <Box component="input" type="password" required minLength={8} autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} sx={inputSx} />
                  </Field>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap", borderTop: `1px solid ${BORDER}`, mt: "36px", pt: "24px" }}>
                  <Typography sx={{ fontFamily: FONT, fontSize: 15, color: MUTED }}>Use at least 8 characters.</Typography>
                  <Box component="button" type="submit" disabled={loading} sx={primaryBtn}>{loading ? "Updating..." : "Update Password"}</Box>
                </Box>
              </Box>
            )}

            {tab === "activity" && (
              <Box sx={{ p: { xs: 3, md: "40px" } }}>
                {activity.length ? (
                  activity.map((a, i) => (
                    <Box key={a.id ?? i} sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: "16px", borderTop: i ? `1px solid ${BORDER}` : 0 }}>
                      <Typography sx={{ fontFamily: FONT, fontSize: 17, color: "#3b3630" }}>{a.title || a.description || a.action}</Typography>
                      <Typography sx={{ fontFamily: FONT, fontSize: 15, color: MUTED, whiteSpace: "nowrap" }}>{formatUpdated(a.created_at)}</Typography>
                    </Box>
                  ))
                ) : (
                  <Typography sx={{ fontFamily: FONT, fontSize: 17, color: MUTED }}>No recent activity.</Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      {!adminOnly && <Footer />}

      <Snackbar open={Boolean(toast)} autoHideDuration={2500} onClose={() => setToast("")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="success" onClose={() => setToast("")} sx={{ width: "100%" }}>{toast}</Alert>
      </Snackbar>
    </>
  );
}