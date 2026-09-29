import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import Navbar from "../Components/Home/NavBar";
import Footer from "../Components/Home/Footer";
import { setProductsError } from "../State/slices/productsSlice";
import { setCart } from "../State/slices/cartSlice";
import AppAPI, { resolveAssetUrl } from "../API";

/* ---------- design tokens (from the screenshots) ---------- */
const PAGE_BG = "#eee9de";
const INK = "#1f1b16";
const BODY = "#57534e";
const MUTED = "#8a8378";
const GOLD = "#b8893c";
const GOLD_LIGHT = "#c4a05f";
const MAROON = "#6b0f22";
const BORDER = "#e4dfd5";
const FONT = '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif';
const SERIF = '"Lora", "Playfair Display", Georgia, "Times New Roman", serif';

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

/* ---------- icons ---------- */
const ip = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
const Svg = ({ size = 20, children, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...ip} {...rest}>{children}</svg>
);
const HeartIcon = ({ filled }) => (
  <Svg fill={filled ? MAROON : "none"} stroke={filled ? MAROON : "#57534e"}><path d="M12 20.5s-7.5-4.6-9.2-9.3C1.7 8 3.5 4.8 6.8 4.8c2 0 3.5 1.1 5.2 3.1 1.7-2 3.2-3.1 5.2-3.1 3.3 0 5.1 3.2 4 6.4-1.7 4.7-9.2 9.3-9.2 9.3z" /></Svg>
);
const ChevronLeft = () => <Svg size={18}><path d="M15 5l-7 7 7 7" /></Svg>;
const ChevronRight = () => <Svg size={18}><path d="M9 5l7 7-7 7" /></Svg>;
const MinusIcon = () => <Svg size={18}><path d="M5 12h14" /></Svg>;
const PlusIcon = () => <Svg size={18}><path d="M12 5v14M5 12h14" /></Svg>;
const CartIcon = () => (
  <Svg size={22}><circle cx="9" cy="20" r="1.3" /><circle cx="18" cy="20" r="1.3" /><path d="M2 3h3l2.6 12.2a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.1L21 8H6" /></Svg>
);
const ShareIcon = () => (
  <Svg size={22}><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" /></Svg>
);
const ShieldIcon = () => <Svg size={22}><path d="M12 3l7.5 3v5.5c0 4.6-3.1 8.2-7.5 9.5-4.4-1.3-7.5-4.9-7.5-9.5V6L12 3z" /></Svg>;
const TruckIcon = () => (
  <Svg size={22}><path d="M2 6h11v10H2zM13 9h4.5L21 12.5V16h-8" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></Svg>
);
const RefreshIcon = () => <Svg size={22}><path d="M20 11a8 8 0 0 0-14.3-4.3L4 8.5M4 4v4.5h4.5M4 13a8 8 0 0 0 14.3 4.3L20 15.5M20 20v-4.5h-4.5" /></Svg>;
const StarIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#f5a623" : "none"} stroke="#f5a623" strokeWidth="1.6" strokeLinejoin="round">
    <path d="M12 2.8l2.8 5.9 6.4.9-4.7 4.5 1.2 6.4L12 17.4 6.3 20.5l1.2-6.4L2.8 9.6l6.4-.9L12 2.8z" />
  </svg>
);

/* ---------- helpers ---------- */
const normalizeImages = (p) => {
  const list = Array.isArray(p?.images) ? p.images.map((i) => (typeof i === "string" ? i : i?.url || i?.image_url)).filter(Boolean).map(resolveAssetUrl) : [];
  const primaryImage = resolveAssetUrl(p?.image_url);
  if (primaryImage && !list.includes(primaryImage)) list.unshift(primaryImage);
  return list;
};

const normalizeSwatches = (p) => {
  if (Array.isArray(p?.colors) && p.colors.length) {
    return p.colors.map((c) =>
      typeof c === "string"
        ? { name: c, hex: typeof CSS !== "undefined" && CSS.supports?.("color", c) ? c : "#c9a96a" }
        : { name: c.name, hex: c.hex || c.code || "#c9a96a" }
    );
  }
  if (!p?.color) return [];
  const colorIsValid = typeof CSS !== "undefined" && CSS.supports?.("color", p.color);
  return [{ name: p.color, hex: colorIsValid ? p.color : "#c9a96a" }];
};

const roundBtn = {
  width: 40, height: 40, borderRadius: "50%", border: 0, cursor: "pointer", color: "#292524",
  display: "grid", placeItems: "center", backdropFilter: "blur(4px)", transition: "background-color .15s",
};

const trustItems = [
  { icon: <ShieldIcon />, text: "Authenticity Guaranteed" },
  { icon: <TruckIcon />, text: "Free Express Shipping" },
  { icon: <RefreshIcon />, text: "15-Day Easy Returns" },
];

/* ---------- page ---------- */
export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const storeItems = useSelector((state) => state.products.items);
  const categories = useSelector((state) => state.products.availableCategories);
  const isLoggedIn = useSelector((state) => Boolean(state.auth.token));

  const fromStore = useMemo(
    () => storeItems.find((p) => String(p.id) === String(id)),
    [storeItems, id]
  );
  const [fetched, setFetched] = useState(null);
  const [loading, setLoading] = useState(false);
  const product = fromStore || fetched;

  const [imgIndex, setImgIndex] = useState(0);
  const [color, setColor] = useState("");
  const [length, setLength] = useState("");
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const [tab, setTab] = useState("description");
  const [toast, setToast] = useState("");

  /* If the product isn't already in the store (e.g. page opened directly), load it. */
  useEffect(() => {
    if (fromStore) return undefined;
    let active = true;
    setLoading(true);
    try {
      AppAPI.getProductById.get({ id })
        .then((result) => { if (active) setFetched(result.data?.product || null); })
        .catch((e) => { if (active) dispatch(setProductsError(e.message)); })
        .finally(() => { if (active) setLoading(false); });
    } catch (err) {
      setLoading(false);
      dispatch(setProductsError(err.message));
    }
    return () => { active = false; };
  }, [id, fromStore, dispatch]);

  const images = useMemo(() => normalizeImages(product), [product]);
  const swatches = useMemo(() => normalizeSwatches(product), [product]);
  const lengths = useMemo(
    () => (Array.isArray(product?.sizes) && product.sizes.length ? product.sizes : product?.saree_length ? [product.saree_length] : []),
    [product]
  );

  useEffect(() => {
    if (!product) return;
    setImgIndex(0);
    setQty(1);
    setColor(swatches.find((s) => s.name === product.color)?.name || swatches[0]?.name || "");
    setLength(lengths[0] || "");
  }, [product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!product) {
    return (
      <>
        <Navbar />
        <Box sx={{ bgcolor: PAGE_BG, minHeight: "65vh", px: { xs: 3, md: "38px" }, py: 8, fontFamily: FONT }}>
          <Typography sx={{ fontFamily: FONT, color: MUTED }}>{loading ? "Loading product..." : "This product could not be found."}</Typography>
        </Box>
        <Footer />
      </>
    );
  }

  const price = Number(product.price || 0);
  const original = Number(product.original_price || 0);
  const off = original > price ? Math.round(((original - price) / original) * 100) : 0;
  const stock = Number(product.stock ?? 1);
  const categoryName = product.category_name || categories?.find((c) => String(c.id) === String(product.category_id))?.name || "Silk Sarees";
  const rating = Number(product.rating || 0);
  const reviewCount = Number(product.review_count || 0);
  const paragraphs = String(product.description || "").split(/\n{2,}|\r\n{2,}/).map((s) => s.trim()).filter(Boolean);
  const specs = [
    ["SKU", product.sku], ["Material", product.material], ["Colour", product.color],
    ["Saree length", product.saree_length], ["Blouse piece", product.blouse_piece],
  ].filter(([, v]) => v);

  const next = (step) => setImgIndex((i) => (i + step + images.length) % images.length);
  const cartPayload = { productId: product.id, quantity: qty };

  const addToCart = () => {
    if (!isLoggedIn) return navigate("/login");
    try {
      AppAPI.addToCart.post(undefined, cartPayload)
        .then((result) => {
          dispatch(setCart(result.data?.cart));
          setToast("Added to cart");
        })
        .catch((e) => setToast(e.message));
    } catch (err) {
      setToast(err.message);
    }
  };
  const buyNow = () => {
    if (!isLoggedIn) return navigate("/login");
    try {
      AppAPI.addToCart.post(undefined, cartPayload)
        .then((result) => {
          dispatch(setCart(result.data?.cart));
          navigate("/checkout");
        })
        .catch((e) => setToast(e.message));
    } catch (err) {
      setToast(err.message);
    }
  };
  const share = () => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: product.name, url }).catch(() => {});
    else navigator.clipboard?.writeText(url).then(() => setToast("Link copied"));
  };

  const tabs = [
    { key: "description", label: "Description" },
    { key: "specs", label: "Specs" },
    { key: "reviews", label: reviewCount ? `Reviews (${reviewCount})` : "Reviews" },
  ];

  return (
    <>
      <Navbar />
      <Box sx={{ bgcolor: PAGE_BG, px: { xs: 2, md: "38px" }, pt: "26px", pb: 8, fontFamily: FONT }}>
        <Box sx={{ maxWidth: 1180, mx: "auto" }}>
          {/* breadcrumb */}
          <Box component="nav" aria-label="Breadcrumb" sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", fontFamily: FONT, fontSize: 15, color: MUTED, mb: "26px" }}>
            <Box component={RouterLink} to="/products" sx={{ color: "inherit", textDecoration: "none", "&:hover": { color: INK } }}>Products</Box>
            <ChevronRight />
            <Box component={RouterLink} to={`/products${product.category_slug ? `?category=${product.category_slug}` : ""}`} sx={{ color: "inherit", textDecoration: "none", "&:hover": { color: INK } }}>{categoryName}</Box>
            <ChevronRight />
            <Box component="span" sx={{ color: INK, fontWeight: 500 }}>{product.name}</Box>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 4, md: "60px" }, alignItems: "start" }}>
            {/* ---------- gallery ---------- */}
            <Box sx={{ display: "flex", flexDirection: { xs: "column-reverse", md: "row" }, gap: "20px" }}>
              {images.length > 1 && (
                <Box sx={{ display: "flex", flexDirection: { xs: "row", md: "column" }, gap: "14px", width: { xs: "100%", md: 100 }, flexShrink: 0, overflowX: { xs: "auto", md: "visible" } }}>
                  {images.map((src, i) => (
                    <Box
                      key={src + i}
                      component="button"
                      type="button"
                      onClick={() => setImgIndex(i)}
                      aria-label={`View ${i + 1}`}
                      sx={{
                        p: 0, cursor: "pointer", bgcolor: "transparent", width: 100, minWidth: 100, height: 122, borderRadius: "10px",
                        overflow: "hidden", border: `2px solid ${i === imgIndex ? GOLD : "transparent"}`, flexShrink: 0,
                        boxShadow: i === imgIndex ? "0 0 0 1px #e9d9b8" : "none",
                      }}
                    >
                      <Box component="img" src={src} alt={`View ${i + 1}`} sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", fontFamily: FONT, fontSize: 20, color: BODY }} />
                    </Box>
                  ))}
                </Box>
              )}

              <Box sx={{ position: "relative", flex: 1, aspectRatio: "9 / 16", maxHeight: 692, borderRadius: "22px", overflow: "hidden", bgcolor: "#e4ddd0", boxShadow: "0 10px 30px rgba(60,40,10,0.18)" }}>
                {images[imgIndex] && (
                  <Box component="img" src={images[imgIndex]} alt={product.name} sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                )}

                <Box sx={{ position: "absolute", top: 20, left: 20, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
                  {product.is_bestseller && (
                    <Box sx={{ px: "14px", height: 30, display: "inline-flex", alignItems: "center", borderRadius: "999px", bgcolor: "rgba(155,28,44,0.92)", color: "#fff", fontFamily: FONT, fontSize: 14.5, fontWeight: 700 }}>Bestseller</Box>
                  )}
                  {stock > 0 && stock <= 5 && (
                    <Box sx={{ px: "14px", height: 30, display: "inline-flex", alignItems: "center", borderRadius: "999px", bgcolor: "#c9a96a", color: "#fff", fontFamily: FONT, fontSize: 14.5, fontWeight: 700 }}>Limited Stock</Box>
                  )}
                </Box>

                <Box
                  component="button"
                  type="button"
                  onClick={() => setWished((w) => !w)}
                  aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                  aria-pressed={wished}
                  sx={{ ...roundBtn, position: "absolute", top: 20, right: 20, width: 46, height: 46, bgcolor: "rgba(255,255,255,0.92)", "&:hover": { bgcolor: "#fff" } }}
                >
                  <HeartIcon filled={wished} />
                </Box>

                {images.length > 1 && (
                  <>
                    <Box component="button" type="button" onClick={() => next(-1)} aria-label="Previous image" sx={{ ...roundBtn, position: "absolute", left: 16, bottom: 34, bgcolor: "rgba(255,255,255,0.75)", "&:hover": { bgcolor: "#fff" } }}>
                      <ChevronLeft />
                    </Box>
                    <Box component="button" type="button" onClick={() => next(1)} aria-label="Next image" sx={{ ...roundBtn, position: "absolute", right: 16, bottom: 34, bgcolor: "rgba(226,222,228,0.85)", "&:hover": { bgcolor: "#fff" } }}>
                      <ChevronRight />
                    </Box>
                  </>
                )}
              </Box>
            </Box>

            {/* ---------- info ---------- */}
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap", mt: "8px" }}>
                <Typography sx={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD_LIGHT }}>
                  {categoryName}
                </Typography>
                {rating > 0 && reviewCount > 0 && <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Box sx={{ display: "flex", gap: "2px" }} aria-label={`Rated ${rating} out of 5`}>
                    {[1, 2, 3, 4, 5].map((n) => <StarIcon key={n} filled={n <= Math.floor(rating)} />)}
                  </Box>
                  <Typography sx={{ fontFamily: FONT, fontSize: 15, color: BODY, fontWeight: 500 }}>
                    {rating.toFixed(1)} <Box component="span" sx={{ color: MUTED, fontWeight: 400 }}>({reviewCount} reviews)</Box>
                  </Typography>
                </Box>}
              </Box>

              <Typography component="h1" sx={{ fontFamily: SERIF, fontSize: { xs: 34, md: 46 }, fontWeight: 700, color: INK, lineHeight: 1.2, mt: "10px" }}>
                {product.name}
              </Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: 17, color: "#7d766b", mt: "8px" }}>
                {[product.sku && `SKU: ${product.sku}`, product.material].filter(Boolean).join(" · ")}
              </Typography>

              {/* price */}
              <Box sx={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", mt: "28px" }}>
                <Typography sx={{ fontFamily: SERIF, fontSize: { xs: 34, md: 42 }, fontWeight: 700, color: MAROON, lineHeight: 1.1 }}>{inr(price)}</Typography>
                {off > 0 && (
                  <>
                    <Typography sx={{ fontFamily: FONT, fontSize: 24, color: "#a8a29e", textDecoration: "line-through" }}>{inr(original)}</Typography>
                    <Box sx={{ px: "14px", height: 32, display: "inline-flex", alignItems: "center", borderRadius: "999px", bgcolor: "#d9f4e6", color: "#059669", fontFamily: FONT, fontSize: 17, fontWeight: 700 }}>{off}% off</Box>
                  </>
                )}
              </Box>
              <Typography sx={{ fontFamily: FONT, fontSize: 15, color: "#a09a90", mt: "8px" }}>Inclusive of all taxes · Free insured shipping</Typography>

              {/* colour */}
              <Typography sx={{ fontFamily: FONT, fontSize: 17, color: BODY, mt: "30px" }}>
                <Box component="span" sx={{ fontWeight: 700, color: "#292524" }}>Colour:</Box> {color}
              </Typography>
              <Box sx={{ display: "flex", gap: "14px", mt: "14px" }} role="radiogroup" aria-label="Colour">
                {swatches.map((s) => {
                  const active = s.name === color;
                  return (
                    <Box
                      key={s.name}
                      component="button"
                      type="button"
                      role="radio"
                      aria-checked={active}
                      aria-label={s.name}
                      title={s.name}
                      onClick={() => setColor(s.name)}
                      sx={{
                        width: 38, height: 38, p: "3px", borderRadius: "50%", bgcolor: "transparent", cursor: "pointer",
                        border: `2px solid ${active ? GOLD : "transparent"}`, "&:hover": { borderColor: active ? GOLD : "#d9cfb9" },
                      }}
                    >
                      <Box sx={{ width: "100%", height: "100%", borderRadius: "50%", bgcolor: s.hex }} />
                    </Box>
                  );
                })}
              </Box>

              {/* length */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: "30px" }}>
                <Typography sx={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, color: "#292524" }}>Length:</Typography>
                <Box component="a" href="/size-guide" sx={{ fontFamily: FONT, fontSize: 16, color: GOLD_LIGHT, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>Size guide →</Box>
              </Box>
              <Box sx={{ display: "flex", gap: "12px", flexWrap: "wrap", mt: "14px" }} role="radiogroup" aria-label="Length">
                {lengths.map((l) => {
                  const active = l === length;
                  return (
                    <Box
                      key={l}
                      component="button"
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setLength(l)}
                      sx={{
                        height: 42, px: "20px", borderRadius: "10px", cursor: "pointer", fontFamily: FONT, fontSize: 16, fontWeight: active ? 500 : 400,
                        color: active ? "#8a6420" : BODY, bgcolor: active ? "#fdf5e6" : "rgba(255,255,255,0.35)",
                        border: `1px solid ${active ? "#d9b56b" : BORDER}`, "&:hover": { borderColor: "#d9b56b" },
                      }}
                    >
                      {l}
                    </Box>
                  );
                })}
              </Box>

              {/* quantity / add to cart / share */}
              <Box sx={{ display: "flex", gap: "16px", mt: "32px" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: 152, height: 54, px: "10px", border: `1px solid ${BORDER}`, borderRadius: "10px", bgcolor: "rgba(255,255,255,0.35)", flexShrink: 0 }}>
                  <Box component="button" type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} sx={{ width: 34, height: 34, border: 0, bgcolor: "transparent", cursor: "pointer", color: BODY, display: "grid", placeItems: "center" }}><MinusIcon /></Box>
                  <Typography sx={{ fontFamily: FONT, fontSize: 17, fontWeight: 600, color: INK }} aria-live="polite">{qty}</Typography>
                  <Box component="button" type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(stock > 0 ? stock : 1, q + 1))} sx={{ width: 34, height: 34, border: 0, bgcolor: "transparent", cursor: "pointer", color: BODY, display: "grid", placeItems: "center" }}><PlusIcon /></Box>
                </Box>
                <Box
                  component="button"
                  type="button"
                  onClick={addToCart}
                  disabled={stock <= 0}
                  sx={{
                    flex: 1, height: 54, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px", border: 0, borderRadius: "10px",
                    bgcolor: MAROON, color: "#fff", fontFamily: FONT, fontSize: 18, fontWeight: 700, cursor: "pointer",
                    "&:hover": { bgcolor: "#570c1b" }, "&:disabled": { opacity: 0.55, cursor: "not-allowed" },
                  }}
                >
                  <CartIcon /> {stock <= 0 ? "Out of Stock" : "Add to Cart"}
                </Box>
                <Box component="button" type="button" onClick={share} aria-label="Share" sx={{ width: 54, height: 54, flexShrink: 0, border: `1px solid ${BORDER}`, borderRadius: "10px", bgcolor: "rgba(255,255,255,0.35)", color: BODY, cursor: "pointer", display: "grid", placeItems: "center", "&:hover": { bgcolor: "#fff" } }}>
                  <ShareIcon />
                </Box>
              </Box>

              <Box
                component="button"
                type="button"
                onClick={buyNow}
                disabled={stock <= 0}
                sx={{
                  width: "100%", height: 56, mt: "16px", bgcolor: "transparent", color: MAROON, border: `2px solid ${MAROON}`, borderRadius: "10px",
                  fontFamily: FONT, fontSize: 18, fontWeight: 700, cursor: "pointer",
                  "&:hover": { bgcolor: "rgba(107,15,34,0.06)" }, "&:disabled": { opacity: 0.55, cursor: "not-allowed" },
                }}
              >
                Buy Now
              </Box>

              {/* trust badges */}
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", mt: "26px" }}>
                {trustItems.map((t) => (
                  <Box key={t.text} sx={{ bgcolor: "#fff", borderRadius: "14px", boxShadow: "0 1px 2px rgba(60,40,10,0.05)", p: "18px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center", color: GOLD_LIGHT }}>
                    {t.icon}
                    <Typography sx={{ fontFamily: FONT, fontSize: 15, color: "#6b655c", lineHeight: 1.3, maxWidth: 120 }}>{t.text}</Typography>
                  </Box>
                ))}
              </Box>

              {/* tabs */}
              <Box sx={{ borderTop: `1px solid ${BORDER}`, mt: "30px", pt: "34px" }}>
                <Box role="tablist" sx={{ display: "flex", gap: "14px", borderBottom: `1px solid ${BORDER}` }}>
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
                          px: "20px", pb: "14px", bgcolor: "transparent", border: 0, cursor: "pointer", fontFamily: FONT, fontSize: 18, fontWeight: 500,
                          color: active ? GOLD : BODY, borderBottom: `2px solid ${active ? GOLD : "transparent"}`, mb: "-1px", "&:hover": { color: GOLD },
                        }}
                      >
                        {t.label}
                      </Box>
                    );
                  })}
                </Box>

                <Box role="tabpanel" sx={{ pt: "22px" }}>
                  {tab === "description" && (
                    paragraphs.length
                      ? paragraphs.map((para, i) => (
                          <Typography key={i} sx={{ fontFamily: FONT, fontSize: 18, lineHeight: 1.6, color: BODY, mb: "16px" }}>{para}</Typography>
                        ))
                      : <Typography sx={{ fontFamily: FONT, fontSize: 18, color: MUTED }}>No description available.</Typography>
                  )}

                  {tab === "specs" && (
                    <Box component="dl" sx={{ m: 0, display: "grid", gridTemplateColumns: "160px 1fr", rowGap: "14px", fontFamily: FONT, fontSize: 17 }}>
                      {specs.map(([k, v]) => (
                        <Box key={k} sx={{ display: "contents" }}>
                          <Box component="dt" sx={{ color: MUTED }}>{k}</Box>
                          <Box component="dd" sx={{ m: 0, color: INK, fontWeight: 500 }}>{v}</Box>
                        </Box>
                      ))}
                      {!specs.length && <Typography sx={{ gridColumn: "1 / -1", color: MUTED }}>No specifications listed.</Typography>}
                    </Box>
                  )}

                  {tab === "reviews" && (
                    <Typography sx={{ fontFamily: FONT, fontSize: 18, color: BODY }}>
                      {reviewCount ? `Rated ${rating.toFixed(1)} out of 5 from ${reviewCount} customer reviews.` : "No reviews yet."}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <Footer />

      <Snackbar open={Boolean(toast)} autoHideDuration={2500} onClose={() => setToast("")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast === "Added to cart" || toast === "Link copied" ? "success" : "error"} onClose={() => setToast("")} sx={{ width: "100%" }}>{toast}</Alert>
      </Snackbar>
    </>
  );
}