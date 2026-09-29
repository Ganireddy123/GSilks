import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import AppAPI, { resolveAssetUrl } from "../API";
import { setAdminError, setAdminLoading, setAdminResource } from "../State/slices/adminSlice";

/* ---------- design tokens (from the screenshots) ---------- */
const BRAND = "#8b0000";
const INK = "#0f172a";
const MUTED = "#94a3b8";
const LABEL = "#8b95a7";
const BORDER = "#e2e8f0";
const PAGE_BG = "#f8fafc";
const FONT = '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const emptyProduct = {
  category_id: "", name: "", price: "", original_price: "", stock: "",
  description: "", image_url: "", material: "", color: "", saree_length: "", blouse_piece: "",
};

// Values the backend used to receive when the old form pre-filled these fields
const submitDefaults = { stock: "0", material: "Silk", saree_length: "5.5 m", blouse_piece: "Attached" };

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const fetchAdminResource = (dispatch, resource, endpoint, responseKey) => {
  dispatch(setAdminLoading(true));
  try {
    AppAPI[endpoint].get()
      .then((result) => dispatch(setAdminResource({ resource, items: result.data?.[responseKey] || [] })))
      .catch((e) => dispatch(setAdminError(e.message)));
  } catch (err) {
    dispatch(setAdminError(err.message));
  }
};

/* ---------- small building blocks ---------- */
const inputSx = {
  width: "100%",
  boxSizing: "border-box",
  fontFamily: FONT,
  fontSize: 15.5,
  color: INK,
  bgcolor: "#fff",
  border: `1px solid ${BORDER}`,
  borderRadius: "12px",
  px: "16px",
  height: 48,
  outline: "none",
  "&::placeholder": { color: MUTED },
  "&:focus": { borderColor: BRAND },
};

function Field({ label, required, children, full }) {
  return (
    <Box sx={{ gridColumn: full ? { sm: "1 / -1" } : "auto" }}>
      <Typography
        component="label"
        sx={{
          display: "block", mb: "8px", fontFamily: FONT, fontSize: 13, fontWeight: 600,
          letterSpacing: "0.06em", textTransform: "uppercase", color: LABEL,
        }}
      >
        {label}{required ? " *" : ""}
      </Typography>
      {children}
    </Box>
  );
}

const cardButtonSx = (color, border) => ({
  flex: 1,
  height: 42,
  fontFamily: FONT,
  fontSize: 13.5,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color,
  bgcolor: "#fff",
  border: `1px solid ${border}`,
  borderRadius: "12px",
  cursor: "pointer",
  transition: "background-color .15s",
  "&:hover": { bgcolor: "#f8fafc" },
});

function ProductCard({ product, categoryName, onEdit, onDelete }) {
  const stock = Number(product.stock || 0);
  const hasDiscount = Number(product.original_price) > Number(product.price);
  const sub = [product.sku, product.material].filter(Boolean).join(" · ");

  return (
    <Box sx={{ bgcolor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <Box sx={{ position: "relative", width: "100%", aspectRatio: "4 / 5", overflow: "hidden", bgcolor: "#f1f5f9" }}>
        {product.image_url && (
          <Box
            component="img"
            src={resolveAssetUrl(product.image_url)}
            alt={product.name}
            loading="lazy"
            sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
        {categoryName && (
          <Box
            sx={{
              position: "absolute", top: 12, right: 12, px: "12px", py: "4px", borderRadius: "999px",
              bgcolor: "rgba(255,255,255,0.92)", fontFamily: FONT, fontSize: 12, fontWeight: 700,
              letterSpacing: "0.06em", textTransform: "uppercase", color: "#475569",
            }}
          >
            {categoryName}
          </Box>
        )}
      </Box>

      <Box sx={{ p: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
        <Typography sx={{ fontFamily: FONT, fontSize: 17, fontWeight: 600, color: INK, lineHeight: 1.35 }}>
          {product.name}
        </Typography>
        <Typography sx={{ fontFamily: FONT, fontSize: 14, color: MUTED, mt: "4px" }}>{sub}</Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mt: "16px", mb: "16px" }}>
          <Box>
            <Typography sx={{ fontFamily: FONT, fontSize: 24, fontWeight: 700, color: BRAND, lineHeight: 1.2 }}>
              {inr(product.price)}
            </Typography>
            {hasDiscount && (
              <Typography sx={{ fontFamily: FONT, fontSize: 14, color: MUTED, textDecoration: "line-through" }}>
                {inr(product.original_price)}
              </Typography>
            )}
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontFamily: FONT, fontSize: 14, color: MUTED }}>Stock</Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: stock <= 0 ? "#dc2626" : INK, lineHeight: 1.2 }}>
              {stock}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: "10px", mt: "auto" }}>
          <Box component="button" type="button" onClick={() => onEdit(product)} sx={cardButtonSx("#2563eb", "#bfdbfe")}>Edit</Box>
          <Box component="button" type="button" onClick={() => onDelete(product.id)} sx={cardButtonSx("#ef4444", "#fecaca")}>Delete</Box>
        </Box>
      </Box>
    </Box>
  );
}

/* ---------- page ---------- */
export default function AdminProducts() {
  const dispatch = useDispatch();
  const { products, categories, loading, error } = useSelector((state) => state.admin);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const fileRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchAdminResource(dispatch, "products", "adminProducts", "products");
    fetchAdminResource(dispatch, "categories", "adminCategories", "categories");
  }, [dispatch]);

  const categoryName = (id) => categories.find((c) => String(c.id) === String(id))?.name || "";
  const outOfStock = products.filter((p) => Number(p.stock) <= 0).length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.name, p.sku, p.material, categoryName(p.category_id)].some((v) => String(v || "").toLowerCase().includes(q))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, categories, query]);

  const setField = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyProduct);
    setSelectedImage(null);
    setSelectedImageName("");
    setUploadingImage(false);
    setNotice("");
    setOpen(true);
  };

  const closeModal = () => {
    if (previewImageUrl) URL.revokeObjectURL(previewImageUrl);
    setOpen(false);
    setEditingId(null);
    setForm(emptyProduct);
    setSelectedImage(null);
    setSelectedImageName("");
    setPreviewImageUrl("");
    setUploadingImage(false);
  };

  const edit = (product) => {
    setEditingId(product.id);
    setSelectedImage(null);
    setSelectedImageName("");
    setUploadingImage(false);
    setNotice("");
    const editableProduct = Object.fromEntries(
      Object.entries(product).filter(([field]) => field !== "slug" && field !== "sku")
    );
    setForm({
      ...emptyProduct,
      ...editableProduct,
      category_id: String(product.category_id),
      price: String(product.price),
      original_price: String(product.original_price || ""),
      stock: String(product.stock),
    });
    setOpen(true);
  };

  const onPickImage = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setSelectedImage(null);
      setSelectedImageName("");
      if (previewImageUrl) URL.revokeObjectURL(previewImageUrl);
      setPreviewImageUrl("");
      return setNotice("Please choose a JPG, PNG or WEBP image.");
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setSelectedImage(null);
      setSelectedImageName("");
      if (previewImageUrl) URL.revokeObjectURL(previewImageUrl);
      setPreviewImageUrl("");
      return setNotice("Image must be 5MB or smaller.");
    }
    setNotice("");
    setSelectedImage(file);
    setSelectedImageName(file.name);
    if (previewImageUrl) URL.revokeObjectURL(previewImageUrl);
    const nextPreview = URL.createObjectURL(file);
    setPreviewImageUrl(nextPreview);
    setForm((f) => ({ ...f, image_url: nextPreview }));
  };

  const submit = (event) => {
    event.preventDefault();
    setNotice("");
    setUploadingImage(true);
    const fields = { ...form };
    Object.entries(submitDefaults).forEach(([key, fallback]) => {
      if (!String(fields[key] ?? "").trim()) fields[key] = fallback;
    });
    if (!String(fields.original_price ?? "").trim()) fields.original_price = fields.price;
    if (Number(fields.original_price) < Number(fields.price)) {
      setUploadingImage(false);
      setNotice("Original price must be the same as or higher than the product price.");
      return;
    }

    if (selectedImage && !(selectedImage instanceof File)) {
      setUploadingImage(false);
      setNotice("A valid product image file is required.");
      return;
    }

    const productData = {
      category_id: fields.category_id,
      name: String(fields.name || "").trim(),
      price: fields.price,
      original_price: fields.original_price,
      stock: fields.stock,
      description: fields.description || "",
      image_url: fields.image_url || "",
      material: fields.material || "",
      color: fields.color || "",
      saree_length: fields.saree_length || "",
      blouse_piece: fields.blouse_piece || "",
    };
    try {
      let payload = productData;
      if (selectedImage) {
        if (!(selectedImage instanceof File)) {
          throw new Error("A valid image file is required.");
        }
        payload = new FormData();
        Object.entries(productData).forEach(([key, value]) => {
          if (key !== "image_url") payload.append(key, String(value ?? ""));
        });
        payload.append("image", selectedImage);
        if (editingId) payload.append("id", String(editingId));
        if (!payload.has("image")) {
          throw new Error("The image file was not attached to the upload request.");
        }
      }
      const request = editingId
        ? AppAPI.updateProduct.put(undefined, payload instanceof FormData ? payload : { id: editingId, ...payload })
        : AppAPI.insertProduct.post(undefined, payload);
      request
        .then((result) => {
          const savedProduct = result.data?.product;
          if (savedProduct) {
            const nextProducts = editingId
              ? products.map((product) => String(product.id) === String(savedProduct.id) ? savedProduct : product)
              : [savedProduct, ...products];
            dispatch(setAdminResource({ resource: "products", items: nextProducts }));
          } else {
            fetchAdminResource(dispatch, "products", "adminProducts", "products");
          }
          closeModal();
          setNotice("Product saved.");
        })
        .catch((e) => setNotice(e.message))
        .finally(() => setUploadingImage(false));
    } catch (err) {
      setNotice(err.message);
      setUploadingImage(false);
    }
  };

  const remove = (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      AppAPI.deleteProduct.delete({ id })
        .then(() => fetchAdminResource(dispatch, "products", "adminProducts", "products"))
        .catch((e) => setNotice(e.message));
    } catch (err) {
      setNotice(err.message);
    }
  };

  const alertBox = (error || notice) && (
    <Alert severity={notice === "Product saved." ? "success" : "error"} sx={{ mb: 2 }}>{notice || error}</Alert>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: PAGE_BG, minHeight: "calc(100vh - 64px)", fontFamily: FONT }}>
      {/* header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap", mb: "28px" }}>
        <Box>
          <Typography component="h1" sx={{ fontFamily: FONT, fontSize: { xs: 28, md: 34 }, fontWeight: 700, color: INK, lineHeight: 1.15 }}>
            Products
          </Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: 15, color: MUTED, mt: "6px" }}>
            {products.length} products total · {outOfStock} out of stock
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Box
            component="input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            sx={{ ...inputSx, width: { xs: 200, sm: 275 }, height: 48, fontSize: 16 }}
          />
          <Box
            component="button"
            type="button"
            onClick={openAdd}
            aria-label="Add product"
            sx={{
              width: 50, height: 50, border: 0, borderRadius: "12px", bgcolor: BRAND, color: "#fff",
              fontSize: 26, fontWeight: 700, lineHeight: 1, cursor: "pointer",
              boxShadow: "0 6px 14px rgba(139,0,0,0.25)", "&:hover": { bgcolor: "#6f0000" },
            }}
          >
            +
          </Box>
        </Box>
      </Box>

      {!open && alertBox}

      {/* product grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }, gap: "20px", alignItems: "stretch" }}>
        {visible.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            categoryName={product.category_name || categoryName(product.category_id)}
            onEdit={edit}
            onDelete={remove}
          />
        ))}
      </Box>
      {!visible.length && !loading && (
        <Typography sx={{ fontFamily: FONT, color: MUTED, textAlign: "center", py: 8 }}>
          {products.length ? "No products match your search." : "No products yet. Use the + button to add one."}
        </Typography>
      )}

      {/* add / edit modal */}
      <Dialog
        open={open}
        onClose={closeModal}
        fullWidth
        maxWidth={false}
        slotProps={{
          paper: {
            sx: {
              width: "100%", maxWidth: 850, m: { xs: 1.5, sm: 4 }, borderRadius: "16px",
              maxHeight: "calc(100% - 48px)", display: "flex", flexDirection: "column", overflow: "hidden",
            },
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", p: "28px 32px 20px", bgcolor: PAGE_BG, borderBottom: `1px solid ${BORDER}` }}>
          <Box>
            <Typography component="h2" sx={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: INK }}>
              {editingId ? "Edit Product" : "Add New Product"}
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: 14.5, color: MUTED, mt: "4px" }}>
              {editingId ? "Update the details below" : "Fill in the details below"}
            </Typography>
          </Box>
          <Box
            component="button"
            type="button"
            onClick={closeModal}
            aria-label="Close"
            sx={{ width: 40, height: 40, bgcolor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "10px", color: "#64748b", fontSize: 20, cursor: "pointer" }}
          >
            ×
          </Box>
        </Box>

        <Box component="form" onSubmit={submit} sx={{ p: "24px 32px 32px", overflowY: "auto", display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: "22px 20px" }}>
          {open && notice && notice !== "Product saved." && (
            <Alert severity="error" sx={{ gridColumn: "1 / -1" }}>{notice}</Alert>
          )}

          <Field label="Product image" full>
            <Box
              role="button"
              tabIndex={0}
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileRef.current?.click()}
              sx={{
                border: "2px dashed #dbe2ea", borderRadius: "14px", bgcolor: "#fff", cursor: "pointer",
                minHeight: 156, display: "grid", placeItems: "center", overflow: "hidden", textAlign: "center",
                "&:hover": { borderColor: BRAND },
              }}
            >
              {form.image_url ? (
                <Box component="img" src={form.image_url.startsWith("blob:") ? form.image_url : resolveAssetUrl(form.image_url)} alt="Product preview" sx={{ maxHeight: 220, maxWidth: "100%", objectFit: "contain", display: "block" }} />
              ) : (
                <Box sx={{ py: 3 }}>
                  <Box sx={{ fontSize: 32, lineHeight: 1 }}>📷</Box>
                  <Typography sx={{ fontFamily: FONT, fontSize: 15.5, fontWeight: 600, color: INK, mt: "10px" }}>
                    Click to upload product image
                  </Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: 13.5, color: MUTED, mt: "6px" }}>
                    JPG, PNG, WEBP up to 5MB
                  </Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mt: 1, flexWrap: "wrap" }}>
              <Typography sx={{ fontFamily: FONT, fontSize: 13, color: MUTED }}>
                {selectedImageName || (form.image_url ? "Current image selected" : "No image selected")}
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Box component="button" type="button" onClick={() => fileRef.current?.click()} sx={{ border: `1px solid ${BORDER}`, borderRadius: "8px", bgcolor: "#fff", px: 1.25, py: 0.75, fontFamily: FONT, fontSize: 12.5, fontWeight: 700, color: BRAND, cursor: "pointer" }}>
                  {selectedImage ? "Change image" : "Choose image"}
                </Box>
                {form.image_url && (
                  <Box
                    component="button"
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setSelectedImageName("");
                      setForm((current) => ({ ...current, image_url: "" }));
                    }}
                    sx={{ border: `1px solid ${BORDER}`, borderRadius: "8px", bgcolor: "#fff", px: 1.25, py: 0.75, fontFamily: FONT, fontSize: 12.5, fontWeight: 700, color: "#ef4444", cursor: "pointer" }}
                  >
                    Remove image
                  </Box>
                )}
              </Box>
            </Box>
            {uploadingImage && (
              <Alert severity="info" sx={{ mt: 1.5 }}>Uploading image...</Alert>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onPickImage} />
          </Field>

          <Field label="Product name" required full>
            <Box component="input" required value={form.name} onChange={setField("name")} placeholder="e.g. Royal Kanchipuram Silk Saree" sx={inputSx} />
          </Field>

          <Field label="Category" required>
            <Box component="select" required value={form.category_id} onChange={setField("category_id")} sx={{ ...inputSx, cursor: "pointer" }}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </Box>
          </Field>
          <Field label="Color">
            <Box component="input" value={form.color || ""} onChange={setField("color")} placeholder="e.g. Royal Blue" sx={inputSx} />
          </Field>

          <Field label="Price (₹)" required>
            <Box component="input" required type="number" min="0" value={form.price} onChange={setField("price")} placeholder="25000" sx={inputSx} />
          </Field>
          <Field label="Original price (₹)">
            <Box component="input" type="number" min="0" value={form.original_price} onChange={setField("original_price")} placeholder="28000" sx={inputSx} />
          </Field>

          <Field label="Stock">
            <Box component="input" type="number" min="0" value={form.stock} onChange={setField("stock")} placeholder="10" sx={inputSx} />
          </Field>
          <Field label="Material">
            <Box component="input" value={form.material || ""} onChange={setField("material")} placeholder="e.g. Pure Silk" sx={inputSx} />
          </Field>

          <Field label="Saree length">
            <Box component="input" value={form.saree_length || ""} onChange={setField("saree_length")} placeholder="5.5 m" sx={inputSx} />
          </Field>
          <Field label="Blouse piece">
            <Box component="input" value={form.blouse_piece || ""} onChange={setField("blouse_piece")} placeholder="Attached / Running" sx={inputSx} />
          </Field>

          <Field label="Description" full>
            <Box
              component="textarea"
              value={form.description || ""}
              onChange={setField("description")}
              placeholder="Product description..."
              sx={{ ...inputSx, height: 100, py: "14px", resize: "vertical", display: "block" }}
            />
          </Field>

          <Box sx={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "12px", mt: "4px" }}>
            <Box
              component="button"
              type="button"
              onClick={closeModal}
              sx={{ height: 50, px: "26px", fontFamily: FONT, fontSize: 15.5, fontWeight: 600, color: "#94a3b8", bgcolor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "12px", cursor: "pointer" }}
            >
              Cancel
            </Box>
            <Box
              component="button"
              type="submit"
              disabled={loading}
              sx={{
                height: 50, px: "34px", fontFamily: FONT, fontSize: 15.5, fontWeight: 700, letterSpacing: "0.04em",
                textTransform: "uppercase", color: "#fff", bgcolor: BRAND, border: 0, borderRadius: "12px", cursor: "pointer",
                "&:hover": { bgcolor: "#6f0000" }, "&:disabled": { opacity: 0.6, cursor: "default" },
              }}
            >
              {editingId ? "Save changes" : "Add product"}
            </Box>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}