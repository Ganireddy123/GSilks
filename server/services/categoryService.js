const db = require('../db/db.js');
const ApiError = require('../utils/ApiError');
const MAX_CATEGORIES = 4;
const categorySelect = `
  SELECT c.id, c.name, c.slug, c.description,
         CASE
           WHEN c.image_url IS NULL OR c.image_url = '' OR c.image_url LIKE '%example.com%'
           THEN (
             SELECT p.image_url
             FROM products p
             WHERE p.category_id = c.id
               AND p.is_active = 1
               AND p.image_url IS NOT NULL
               AND p.image_url <> ''
               AND p.image_url NOT LIKE '%example.com%'
             ORDER BY p.is_featured DESC, p.created_at DESC
             LIMIT 1
           )
           ELSE c.image_url
         END AS image_url,
         c.is_active, c.created_at, c.updated_at
  FROM categories c`;

const CategoryService = () => {
  const getAllCategories = async (DATA = {}) => {
    const { isActiveOnly = false } = DATA;
    const query = isActiveOnly
      ? `${categorySelect} WHERE c.is_active = 1 ORDER BY c.created_at DESC`
      : `${categorySelect} ORDER BY c.created_at DESC`;
    return await db.query(query, []);
  };

  const getCategoryById = async (DATA) => {
    const rows = await db.query(`${categorySelect} WHERE c.id = ? LIMIT 1`, [DATA.id]);
    if (!rows.length) {
      throw new ApiError(404, 'Category not found.', ['The requested category does not exist.']);
    }
    return rows[0];
  };

  const createCategory = async (DATA) => {
    const { name, slug, description = '', image_url = '', is_active = 1 } = DATA;
    if (!name || !slug) {
      throw new ApiError(400, 'Category name and slug are required.', ['Category name and slug are required.']);
    }
    const countRows = await db.query('SELECT COUNT(*) AS total FROM categories');
    if (Number(countRows[0].total) >= MAX_CATEGORIES) {
      throw new ApiError(400, `A maximum of ${MAX_CATEGORIES} categories is allowed.`, ['Category limit reached.']);
    }

    try {
      const result = await db.query(
        'INSERT INTO categories (name, slug, description, image_url, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [name.trim(), String(slug).trim(), description, image_url, is_active ? 1 : 0]
      );
      return await getCategoryById({ id: result.insertId });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ApiError(409, 'A category with this slug already exists.', ['Category slug must be unique.']);
      }
      throw error;
    }
  };

  const updateCategory = async (DATA) => {
    const existing = await getCategoryById({ id: DATA.id });
    const updatedName = DATA.name ?? existing.name;
    const updatedSlug = DATA.slug ?? existing.slug;
    const updatedDescription = DATA.description ?? existing.description;
    const updatedImageUrl = DATA.image_url ?? existing.image_url;
    const updatedIsActive = DATA.is_active !== undefined
      ? (DATA.is_active ? 1 : 0)
      : existing.is_active;

    try {
      await db.query(
        'UPDATE categories SET name = ?, slug = ?, description = ?, image_url = ?, is_active = ?, updated_at = NOW() WHERE id = ?',
        [updatedName, updatedSlug, updatedDescription, updatedImageUrl, updatedIsActive, DATA.id]
      );
      return await getCategoryById({ id: DATA.id });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ApiError(409, 'A category with this slug already exists.', ['Category slug must be unique.']);
      }
      throw error;
    }
  };

  const deleteCategory = async (DATA) => {
    const existing = await getCategoryById({ id: DATA.id });
    const productRows = await db.query('SELECT id FROM products WHERE category_id = ? LIMIT 1', [DATA.id]);
    if (productRows.length) {
      throw new ApiError(400, 'This category is in use by products and cannot be deleted.', ['Category is associated with products.']);
    }
    await db.query('DELETE FROM categories WHERE id = ?', [DATA.id]);
    return { deletedId: existing.id, deletedName: existing.name };
  };

  return { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
};

module.exports = CategoryService;
