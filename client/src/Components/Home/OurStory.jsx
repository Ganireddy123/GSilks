import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";

const COLORS = {
  bg: "#F7F3EC",
  maroon: "#7A1F2B",
  gold: "#B98A3D",
  ink: "#2B2620",
  inkMuted: "rgba(43,38,32,0.7)",
};

const STATS = [
  { value: "120+", label: "Weaver families" },
  { value: "8", label: "Weaving clusters" },
  { value: "100%", label: "Silk Mark certified" },
];

export default function OurStory() {
  return (
    <Box id="about" sx={{ bgcolor: COLORS.bg, py: { xs: 6, md: 8 }, px: { xs: 3, md: 6 }, scrollMarginTop: 88 }}>
      <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
        {/* Image */}
        <Grid item xs={12} md={6}>
          <Box
            component="img"
            // TODO: replace with your real weaver/loom photograph
            src="https://placehold.co/700x820/3A2A22/D9BE6B?text=Weaver+at+Loom"
            alt="Master weaver's hands working a silk saree on a traditional loom"
            sx={{
              width: "100%",
              height: { xs: 320, sm: 460, md: 560 },
              objectFit: "cover",
              display: "block",
            }}
          />
        </Grid>

        {/* Text content */}
        <Grid item xs={12} md={6}>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: COLORS.gold,
              mb: 2,
            }}
          >
            OUR STORY
          </Typography>

          <Typography
            component="h2"
            sx={{
              fontFamily: "var(--font-heading, Georgia, 'Times New Roman', serif)",
              color: COLORS.maroon,
              fontSize: { xs: 36, sm: 44, md: 52 },
              lineHeight: 1.15,
              mb: 3,
            }}
          >
            Every thread carries a{" "}
            <Box component="span" sx={{ fontStyle: "italic" }}>
              lineage
            </Box>
          </Typography>

          <Typography
            sx={{
              color: COLORS.inkMuted,
              fontSize: { xs: 15.5, md: 16.5 },
              lineHeight: 1.75,
              mb: 4,
              maxWidth: 520,
            }}
          >
            GSilks began with a simple belief — that the finest sarees should
            come straight from the hands that weave them. We work directly
            with master weavers in Kanchipuram, Varanasi, Dharmavaram and
            Arani, paying fairly and preserving techniques centuries in the
            making.
          </Typography>

          {/* Stats */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            {STATS.map((s) => (
              <Grid item xs={4} key={s.label}>
                <Typography
                  sx={{
                    fontFamily: "var(--font-heading, Georgia, 'Times New Roman', serif)",
                    color: COLORS.maroon,
                    fontSize: { xs: 26, md: 32 },
                    lineHeight: 1.1,
                    mb: 0.5,
                  }}
                >
                  {s.value}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13,
                    color: COLORS.inkMuted,
                  }}
                >
                  {s.label}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* CTA */}
          <Box
            component="a"
            href="/#about"
            sx={{
              display: "inline-block",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: COLORS.maroon,
              textDecoration: "none",
              borderBottom: `1px solid ${COLORS.maroon}`,
              pb: 0.5,
              "&:hover": { opacity: 0.75 },
            }}
          >
            READ OUR STORY
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}