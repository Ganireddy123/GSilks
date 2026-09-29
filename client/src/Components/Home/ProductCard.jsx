import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Alert from "@mui/material/Alert";
import { setCart } from "../../State/slices/cartSlice";
import { setProducts, setProductsError, setProductsLoading } from "../../State/slices/productsSlice";
import { resolveAssetUrl } from "../../API";
import AppAPI from "../../API";

const COLORS = {
  bg: "#F6F2EA",
  maroon: "#7A1F2B",
  maroonDark: "#5C1620",
  gold: "#B98A3D",
  ink: "#2B2620",
  green: "#2E7D4F",
};

const FALLBACK_PRODUCTS = [
  {
    category: "BANARASI SILK",
    name: "Emerald Banarasi Buti",
    price: 21900,
    originalPrice: 24500,
    discount: "11% OFF",
    inStock: true,
    // TODO: replace with your real product photo
    image: "https://placehold.co/500x560/1F3A2E/F7F0E4?text=Emerald+Banarasi",
  },
  {
    category: "SOFT SILK",
    name: "Blush Soft Silk",
    price: 9800,
    originalPrice: 11500,
    discount: "15% OFF",
    inStock: true,
    image: "https://placehold.co/500x560/D9B8B0/F7F0E4?text=Blush+Soft+Silk",
  },
  {
    category: "HANDLOOM SILK",
    name: "Haldi Handloom Silk",
    price: 12400,
    originalPrice: 13800,
    discount: "10% OFF",
    inStock: true,
    image: "https://placehold.co/500x560/C99A2E/F7F0E4?text=Haldi+Handloom",
  },
  {
    category: "BRIDAL SILK",
    name: "Ruby Bridal Zari Silk",
    price: 28900,
    originalPrice: 32500,
    discount: "11% OFF",
    inStock: true,
    image: "https://placehold.co/500x560/7A1F2B/F7F0E4?text=Ruby+Bridal+Silk",
  },
];

const formatINR = (n) => `\u20B9${n.toLocaleString("en-IN")}`;

export function ProductCard({ product }) {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => Boolean(state.auth.token));
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState("");
  const category = product.category_name || product.category || "SILK SAREE";
  const name = product.name;
  const price = Number(product.price);
  const originalPrice = Number(product.original_price || product.price);
  const discount = originalPrice > price
    ? `${Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF`
    : "NEW ARRIVAL";
  const inStock = Number(product.stock) > 0;
  const image = product.image_url?.includes("images.example.com")
    ? FALLBACK_PRODUCTS.find((item) => item.category.toLowerCase().includes(String(category).split(" ")[0].toLowerCase()))?.image || FALLBACK_PRODUCTS[0].image
    : resolveAssetUrl(product.image_url || product.image) || FALLBACK_PRODUCTS[0].image;

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setFeedback("");
    try {
      setAdding(true);
      AppAPI.addToCart.post(undefined, { productId: product.id, quantity: 1 })
        .then((result) => {
          dispatch(setCart(result.data?.cart));
          setFeedback("Added to cart");
        })
        .catch((e) => setFeedback(e.message))
        .finally(() => setAdding(false));
    } catch (error) {
      setFeedback(error.message);
      setAdding(false);
    }
  };

  return (
    <Box>
      {/* Image */}
      <Box sx={{ position: "relative", height: { xs: 280, sm: 320, lg: 300 }, mb: 1.5 }}>
        <Box
          component="img"
          src={image}
          alt={name}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            bgcolor: "#fff",
          }}
        />
        <Chip
          label={discount}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            bgcolor: COLORS.maroonDark,
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.05em",
            height: 24,
          }}
        />
        <IconButton
          aria-label="Add to wishlist"
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            bgcolor: "rgba(255,255,255,0.9)",
            width: 32,
            height: 32,
            "&:hover": { bgcolor: "#fff" },
          }}
        >
          <FavoriteBorderIcon sx={{ fontSize: 16, color: COLORS.ink }} />
        </IconButton>
      </Box>

      {/* Details */}
      <Typography
        sx={{
          fontSize: 11.5,
          fontWeight: 700,
          letterSpacing: "0.14em",
          color: COLORS.gold,
          mb: 0.75,
        }}
      >
        {category}
      </Typography>

      <Typography
        sx={{
          fontFamily: "var(--font-heading, Georgia, 'Times New Roman', serif)",
          fontSize: { xs: 18, md: 19 },
          color: COLORS.maroonDark,
          mb: 1,
        }}
      >
        {name}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 0.5 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: COLORS.ink }}>
          {formatINR(price)}
        </Typography>
        <Typography
          sx={{
            fontSize: 14,
            color: "text.secondary",
            textDecoration: "line-through",
          }}
        >
          {formatINR(originalPrice)}
        </Typography>
      </Box>

      <Typography sx={{ fontSize: 13, color: COLORS.green, mb: 2 }}>
        {inStock ? "In stock" : "Out of stock"}
      </Typography>

      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Button
          onClick={handleAddToCart}
          disabled={adding || !inStock}
          variant="contained"
          disableElevation
          fullWidth
          sx={{
            bgcolor: COLORS.maroonDark,
            fontSize: 13,
            fontWeight: 600,
            py: 1,
            borderRadius: 0.5,
            "&:hover": { bgcolor: COLORS.maroon },
          }}
        >
          {adding ? "Adding..." : inStock ? "Add to Cart" : "Out of Stock"}
        </Button>
        <Button
          onClick={() => product.id && navigate(`/products/${product.id}`)}
          disabled={!product.id}
          variant="outlined"
          fullWidth
          sx={{
            borderColor: "rgba(43,38,32,0.25)",
            color: COLORS.ink,
            fontSize: 13,
            fontWeight: 600,
            py: 1,
            borderRadius: 0.5,
            "&:hover": {
              borderColor: COLORS.ink,
              bgcolor: "rgba(43,38,32,0.04)",
            },
          }}
        >
          View Details
        </Button>
      </Box>
      {feedback && <Alert severity={feedback === "Added to cart" ? "success" : "error"} sx={{ mt: 1 }}>{feedback}</Alert>}
    </Box>
  );
}

export default function NewArrivals() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.products.items);
  const products = items.length ? items : FALLBACK_PRODUCTS;

  useEffect(() => {
    dispatch(setProductsLoading(true));
    try {
      AppAPI.getProducts.get({ limit: 12 })
        .then((result) => dispatch(setProducts(result.data)))
        .catch((e) => dispatch(setProductsError(e.message)));
    } catch (err) {
      dispatch(setProductsError(err.message));
    }
  }, [dispatch]);

  return (
    <Box sx={{ bgcolor: COLORS.bg, py: { xs: 6, md: 8 }, px: { xs: 3, md: 6 } }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.2em",
              color: COLORS.gold,
              mb: 1,
            }}
          >
            Just Arrived
          </Typography>
          <Typography
            component="h2"
            sx={{
              fontFamily: "var(--font-heading, Georgia, 'Times New Roman', serif)",
              color: COLORS.maroon,
              fontSize: { xs: 34, md: 46 },
              lineHeight: 1.1,
            }}
          >
            New Arrivals
          </Typography>
        </Box>

        <Box
          component={Link}
          to="/products"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            color: COLORS.maroon,
            textDecoration: "none",
            fontSize: 15,
            "&:hover": { opacity: 0.75 },
          }}
        >
          Veiw All
          <ArrowForwardIcon sx={{ fontSize: 18 }} />
        </Box>
      </Box>

      {/* Grid */}
      <Grid container spacing={{ xs: 2, md: 2.5 }}>
        {products.map((p) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={p.id || p.name}>
            <ProductCard product={p} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}