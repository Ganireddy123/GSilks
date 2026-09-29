import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const EMPTY = { name: "", slug: "", description: "", image: "", sort_order: 0, active: true };

export default function CategoryDialog({ open, category, onOpenChange, onSave, saving }) {
  const [form, setForm] = useState(EMPTY);
  useEffect(() => {
    if (open) setForm(category ? { ...category } : EMPTY);
  }, [open, category]);

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontFamily: "var(--font-heading, inherit)", fontSize: 24 }}>
        {category ? "Edit category" : "Add category"}
      </DialogTitle>

      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Categories organise the storefront collections.
        </DialogContentText>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Name"
            id="cat-name"
            value={form.name}
            placeholder="Kanchipuram Silk"
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Slug (auto if blank)"
            id="cat-slug"
            value={form.slug}
            placeholder="kanchipuram-silk"
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Description"
            id="cat-desc"
            value={form.description || ""}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            fullWidth
            multiline
            minRows={3}
          />
          <TextField
            label="Image URL"
            id="cat-img"
            value={form.image || ""}
            placeholder="https://…"
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
            fullWidth
          />

          <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2 }}>
            <TextField
              label="Sort order"
              id="cat-sort"
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))}
            />
            <Box sx={{ display: "flex", alignItems: "center", pb: 1.5 }}>
              <FormControlLabel
                control={
                  <Switch
                    id="cat-active"
                    checked={form.active !== false}
                    onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  />
                }
                label={
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Active
                  </Typography>
                }
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          variant="contained"
          sx={{
            bgcolor: "maroon",
            "&:hover": { bgcolor: "#7a1f2b" }, // maroon-light placeholder
          }}
          disabled={saving || !form.name.trim()}
          onClick={() =>
            onSave({
              ...form,
              name: form.name.trim(),
              slug: form.slug || slugify(form.name),
              sort_order: Number(form.sort_order) || 0,
            })
          }
        >
          {saving ? "Saving…" : "Save category"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}