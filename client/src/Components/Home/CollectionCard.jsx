import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import heroImage from "../../assets/hero.png";
import { resolveAssetUrl } from "../../API";
import { setCategories, setProductsError } from "../../State/slices/productsSlice";
import AppAPI from "../../API";

const COLORS = {
  bg: "#F6F2EA",
  gold: "#B98A3D",
  maroon: "#7A1F2B",
  ivory: "#F7F0E4",
};

const COLLECTIONS = [
  {
    title: "Kanchipuram Silk",
    description: "Temple borders woven in pure mulberry silk and gold zari.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Banarasi Silk",
    description: "Brocades from the looms of Varanasi.",
    image: "https://images.unsplash.com/photo-1594736797933-d0f06ba7f5c7?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Mysore Silk Sarees",
    description: "Premium Mysore silk sarees with classic designs.",
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Designer Silk Sarees",
    description: "Modern designer silk sarees for special occasions.",
    image: "https://images.unsplash.com/photo-1583391733981-8498408e10c1?auto=format&fit=crop&w=800&q=80",
  },
];

function CollectionCard({ title, description, image, fallbackImage = image }) {
  const [imageSrc, setImageSrc] = React.useState(image);

  React.useEffect(() => {
    setImageSrc(image);
  }, [image]);

  return (
    <Box
      sx={{
        position: "relative",
        height: 320,
        borderRadius: 0.5,
        overflow: "hidden",
        cursor: "pointer",
        "&:hover img": { transform: "scale(1.04)" },
      }}
    >
      <Box
        component="img"
        src={imageSrc}
        alt={title}
        onError={() => {
          setImageSrc((currentImage) =>
            currentImage === fallbackImage ? currentImage : fallbackImage,
          );
        }}
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "transform 0.4s ease",
        }}
      />
      {/* Bottom gradient for text legibility */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(58,18,22,0) 45%, rgba(58,18,22,0.75) 100%)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          p: 2.5,
        }}
      >
        <Typography
          sx={{
            fontFamily: "var(--font-heading, Georgia, 'Times New Roman', serif)",
            color: COLORS.ivory,
            fontSize: 24,
            lineHeight: 1.2,
            mb: 0.5,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            color: "rgba(247,240,228,0.85)",
            fontSize: 13.5,
            lineHeight: 1.4,
          }}
        >
          {description}
        </Typography>
      </Box>
    </Box>
  );
}

export default function FeaturedCollections() {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.products.categories);
  const collections = categories.length
    ? categories.map((category, index) => {
      const fallback = COLLECTIONS[index % COLLECTIONS.length];
      const isPlaceholderImage = !category.image_url || category.image_url.includes("example.com");
      return {
        title: category.name,
        description: category.description || "Explore the latest collection.",
        image: isPlaceholderImage ? fallback.image : resolveAssetUrl(category.image_url),
        fallbackImage: heroImage,
      };
    })
    : COLLECTIONS.map((collection) => ({ ...collection, fallbackImage: heroImage }));

  React.useEffect(() => {
    try {
      AppAPI.getCategories.get()
        .then((result) => dispatch(setCategories(result.data?.categories || [])))
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
            FEATURED COLLECTIONS
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
            Woven across India
          </Typography>
        </Box>

        <Box
          component="a"
          href="/collections"
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
          All collections
          <ArrowForwardIcon sx={{ fontSize: 18 }} />
        </Box>
      </Box>

      {/* Grid */}
      <Grid container spacing={2.5}>
        {collections.map((c) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={c.title}>
            <CollectionCard {...c} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}