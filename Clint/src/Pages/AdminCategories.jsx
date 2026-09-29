import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AppAPI from "../API";
import { setAdminError, setAdminLoading, setAdminResource } from "../State/slices/adminSlice";

const MAX_CATEGORIES = 4;
const emptyCategory = { name: "", slug: "", description: "", image_url: "" };
const BRAND = "#8b0000";
const INK = "#0f172a";
const MUTED = "#94a3b8";
const BORDER = "#e2e8f0";
const PAGE_BG = "#f8fafc";
const FONT = '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif';

const fetchCategories = (dispatch) => {
  dispatch(setAdminLoading(true));
  try {
    AppAPI.adminCategories.get()
      .then((result) => dispatch(setAdminResource({ resource: "categories", items: result.data?.categories || [] })))
      .catch((e) => dispatch(setAdminError(e.message)));
  } catch (err) {
    dispatch(setAdminError(err.message));
  }
};

export default function AdminCategories() {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector((state) => state.admin);
  const [form, setForm] = useState(emptyCategory);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  useEffect(() => { fetchCategories(dispatch); }, [dispatch]);

  const visibleCategories = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return categories;
    return categories.filter((category) =>
      [category.name, category.slug, category.description]
        .some((value) => String(value || "").toLowerCase().includes(search))
    );
  }, [categories, query]);

  const closeDialog = () => {
    setOpen(false);
    setEditingId(null);
    setForm(emptyCategory);
  };

  const openAdd = () => {
    setEditingId(null);
    setNotice("");
    setForm(emptyCategory);
    setOpen(true);
  };

  const edit = (category) => {
    setEditingId(category.id);
    setNotice("");
    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      image_url: category.image_url || "",
    });
    setOpen(true);
  };

  const submit = (event) => {
    event.preventDefault();
    setNotice("");
    try {
      const request = editingId
        ? AppAPI.updateCategory.put({ id: editingId }, form)
        : AppAPI.insertCategory.post(undefined, form);
      request
        .then((result) => {
          const savedCategory = result.data?.category;
          if (editingId && savedCategory) {
            dispatch(setAdminResource({
              resource: "categories",
              items: categories.map((category) => String(category.id) === String(savedCategory.id) ? savedCategory : category),
            }));
          } else {
            fetchCategories(dispatch);
          }
          closeDialog();
          setNotice("Category saved.");
        })
        .catch((e) => setNotice(e.message));
    } catch (err) {
      setNotice(err.message);
    }
  };
  const remove = (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      AppAPI.deleteCategory.delete({ id })
        .then(() => fetchCategories(dispatch))
        .catch((e) => setNotice(e.message));
    } catch (err) {
      setNotice(err.message);
    }
  };

  const inputSx = {
    width: "100%", boxSizing: "border-box", fontFamily: FONT, fontSize: 15,
    color: INK, bgcolor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "10px",
    px: "14px", height: 46, outline: "none", "&:focus": { borderColor: BRAND },
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: PAGE_BG, minHeight: "100%", fontFamily: FONT }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <Box>
          <Typography component="h1" sx={{ fontFamily: FONT, fontSize: { xs: 28, md: 34 }, fontWeight: 700, color: INK, lineHeight: 1.15 }}>
            Categories
          </Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: 15, color: MUTED, mt: "6px" }}>
            {categories.length} of {MAX_CATEGORIES} categories
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
          <Box
            component="input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search categories..."
            aria-label="Search categories"
            sx={{ ...inputSx, width: { xs: 200, sm: 275 }, height: 48 }}
          />
          <Button
            onClick={openAdd}
            disabled={loading || categories.length >= MAX_CATEGORIES}
            variant="contained"
            sx={{ height: 48, bgcolor: BRAND, fontFamily: FONT, fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#6f0000" } }}
          >
            Add category
          </Button>
        </Box>
      </Box>

      {(error || notice) && !open && (
        <Alert severity={notice === "Category saved." ? "success" : "error"} sx={{ mb: 2 }}>
          {notice || error}
        </Alert>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }, gap: 2.5 }}>
        {visibleCategories.map((category) => (
          <Box key={category.id} sx={{ bgcolor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "16px", overflow: "hidden" }}>
            {category.image_url ? (
              <Box component="img" src={category.image_url} alt={category.name} sx={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover", display: "block", bgcolor: "#f1f5f9" }} />
            ) : (
              <Box sx={{ width: "100%", aspectRatio: "16 / 9", display: "grid", placeItems: "center", bgcolor: "#f1f5f9", color: MUTED, fontFamily: FONT }}>No image</Box>
            )}
            <Box sx={{ p: 2.5 }}>
              <Typography sx={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: INK }}>{category.name}</Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: 13, color: MUTED, mt: 0.5 }}>{category.slug}</Typography>
              {category.description && (
                <Typography sx={{ fontFamily: FONT, fontSize: 14, color: "#64748b", mt: 1.5, minHeight: 42 }}>{category.description}</Typography>
              )}
              <Box sx={{ display: "flex", gap: 1.25, mt: 2.5 }}>
                <Button onClick={() => edit(category)} variant="outlined" sx={{ flex: 1, borderColor: BORDER, color: INK, fontFamily: FONT, fontWeight: 700 }}>Edit</Button>
                <Button onClick={() => remove(category.id)} variant="outlined" color="error" sx={{ flex: 1, fontFamily: FONT, fontWeight: 700 }}>Delete</Button>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
      {!visibleCategories.length && !loading && (
        <Typography sx={{ fontFamily: FONT, color: MUTED, textAlign: "center", py: 8 }}>
          {categories.length ? "No categories match your search." : "No categories found."}
        </Typography>
      )}

      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="sm">
        <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Typography component="h2" sx={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: INK, mb: 2.5 }}>
            {editingId ? "Edit Category" : "Add Category"}
          </Typography>
          {(error || (notice && notice !== "Category saved.")) && (
            <Alert severity="error" sx={{ mb: 2 }}>{notice || error}</Alert>
          )}
          <Box component="form" onSubmit={submit} sx={{ display: "grid", gap: 2 }}>
            <TextField label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required fullWidth />
            <TextField label="Slug" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} required fullWidth />
            <TextField label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} multiline minRows={3} fullWidth />
            <TextField label="Image URL" value={form.image_url} onChange={(event) => setForm({ ...form, image_url: event.target.value })} fullWidth />
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 1 }}>
              <Button onClick={closeDialog} sx={{ color: "#64748b", fontFamily: FONT, fontWeight: 600 }}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: BRAND, fontFamily: FONT, fontWeight: 700, "&:hover": { bgcolor: "#6f0000" } }}>
                {editingId ? "Save changes" : "Add category"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}
