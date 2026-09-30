const db = require('../db/db.js');
const pool = db.pool;
const ApiError = require('../utils/ApiError');
const getSafeErrorMessage = require('../utils/safeErrorMessage');

const slugifyProductName = (name) => String(name)
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '') || 'product';

const generateUniqueProductValue = async (column, base, maxLength) => {
  let attempt = 1;
  while (true) {
    const suffix = attempt === 1 ? '' : `-${attempt}`;
    const candidate = `${base.slice(0, maxLength - suffix.length)}${suffix}`;
    const rows = await db.query(`SELECT id FROM products WHERE ${column} = ? LIMIT 1`, [candidate]);
    if (!rows.length) return candidate;
    attempt += 1;
  }
};

const ProductService = () => {
const sanitizeProduct = (product) => {
  if (!product) return null;
  return {
    ...product,
    price: Number(product.price),
    original_price: Number(product.original_price),
    stock: Number(product.stock)
  };
};

const getAllProducts = async (DATA = {}) => {
  const filters = DATA;
  const {
    search = '',
    category,
    minPrice,
    maxPrice,
    featured,
    page = 1,
    limit = 12,
    activeOnly = true
  } = filters;

  const offset = (Number(page) - 1) * Number(limit);
  const params = [];
  const whereClauses = [];

  if (activeOnly) {
    whereClauses.push('p.is_active = 1');
  }

  if (search) {
    whereClauses.push('(p.name LIKE ? OR p.description LIKE ? OR p.material LIKE ? OR p.color LIKE ?)');
    const searchValue = `%${search}%`;
    params.push(searchValue, searchValue, searchValue, searchValue);
  }

  if (category) {
    whereClauses.push('c.slug = ?');
    params.push(category);
  }

  if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
    whereClauses.push('p.price >= ?');
    params.push(Number(minPrice));
  }

  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
    whereClauses.push('p.price <= ?');
    params.push(Number(maxPrice));
  }

  if (featured !== undefined && featured !== null && featured !== '') {
    whereClauses.push('p.is_featured = ?');
    params.push(featured === true || featured === 'true' ? 1 : 0);
  }

  const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countRows = await db.query(
    `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON c.id = p.category_id ${whereSQL}`,
    params
  );

  const totalItems = Number(countRows[0].total);
  const totalPages = Math.max(1, Math.ceil(totalItems / Number(limit)) || 1);

  const query = `
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    ${whereSQL}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const rows = await db.query(query, [...params, Number(limit), offset]);

  return {
    items: rows.map(sanitizeProduct),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalItems,
      totalPages,
      hasNextPage: Number(page) < totalPages,
      hasPreviousPage: Number(page) > 1
    }
  };
};

const getProductById = async (DATA) => {
  const rows = await db.query(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.id = ? LIMIT 1`,
    [DATA.id]
  );

  if (!rows.length) {
    throw new ApiError(404, 'Product not found.', ['The requested product does not exist.']);
  }

  return sanitizeProduct(rows[0]);
};

const getProductsByCategoryId = async (DATA) => {
  const rows = await db.query(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug
     FROM products p
     INNER JOIN categories c ON c.id = p.category_id
     WHERE p.category_id = ? AND p.is_active = 1 AND c.is_active = 1
     ORDER BY p.created_at DESC`,
    [DATA.categoryId]
  );

  return rows.map(sanitizeProduct);
};

const createProduct = async (DATA) => {
  const {
    category_id,
    name,
    description,
    price,
    original_price,
    stock,
    image_url,
    material,
    color,
    saree_length,
    blouse_piece,
    is_featured,
    is_active
  } = DATA;

  if (!category_id || !name || !price) {
    throw new ApiError(400, 'Category, name, and price are required.', ['Missing required product fields.']);
  }

  const productPrice = Number(price);
  if (Number.isNaN(productPrice) || productPrice <= 0) {
    throw new ApiError(400, 'Product price must be greater than zero.', ['Price is invalid.']);
  }

  const productStock = Number(stock ?? 0);
  if (Number.isNaN(productStock) || productStock < 0) {
    throw new ApiError(400, 'Product stock must be zero or greater.', ['Stock is invalid.']);
  }

  try {
    const nameSlug = slugifyProductName(name);
    const slug = await generateUniqueProductValue('slug', nameSlug, 300);
    const skuBase = `GS-${String(category_id).padStart(3, '0')}-${nameSlug.toUpperCase()}`;
    const sku = await generateUniqueProductValue('sku', skuBase, 100);
    const result = await db.query(
      `INSERT INTO products (
        category_id, name, slug, sku, description, price, original_price, stock,
        image_url, material, color, saree_length, blouse_piece, is_featured, is_active,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        Number(category_id),
        String(name).trim(),
        String(slug).trim(),
        String(sku).trim(),
        description || '',
        productPrice,
        Number(original_price ?? productPrice),
        productStock,
        image_url || '',
        material || '',
        color || '',
        saree_length || '',
        blouse_piece || '',
        is_featured ? 1 : 0,
        is_active === false ? 0 : 1
      ]
    );

    return await getProductById({ id: result.insertId });
  } catch (error) {
    const safeMessage = getSafeErrorMessage(error.message);
    console.error('DATABASE IMAGE INSERT ERROR:', safeMessage);
    if (error.code === 'ER_DUP_ENTRY') {
      throw new ApiError(409, 'A product with this slug or SKU already exists.', ['Duplicate product identifier.']);
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      throw new ApiError(400, 'Category not found.', ['The selected category does not exist.']);
    }
    const databaseError = new ApiError(500, safeMessage);
    databaseError.exposeSafeMessage = true;
    throw databaseError;
  }
};

const updateProduct = async (DATA) => {
  const { id, ...payload } = DATA;
  const existing = await getProductById({ id });

  const merged = {
    category_id: payload.category_id ?? existing.category_id,
    name: payload.name ?? existing.name,
    slug: payload.slug ?? existing.slug,
    sku: payload.sku ?? existing.sku,
    description: payload.description ?? existing.description,
    price: payload.price ?? existing.price,
    original_price: payload.original_price ?? existing.original_price,
    stock: payload.stock ?? existing.stock,
    image_url: payload.image_url && String(payload.image_url).trim() ? payload.image_url : existing.image_url,
    material: payload.material ?? existing.material,
    color: payload.color ?? existing.color,
    saree_length: payload.saree_length ?? existing.saree_length,
    blouse_piece: payload.blouse_piece ?? existing.blouse_piece,
    is_featured: payload.is_featured !== undefined ? (payload.is_featured ? 1 : 0) : existing.is_featured,
    is_active: payload.is_active !== undefined ? (payload.is_active ? 1 : 0) : existing.is_active
  };

  try {
    await db.query(
      `UPDATE products SET
        category_id = ?, name = ?, slug = ?, sku = ?, description = ?, price = ?,
        original_price = ?, stock = ?, image_url = ?, material = ?, color = ?,
        saree_length = ?, blouse_piece = ?, is_featured = ?, is_active = ?, updated_at = NOW()
      WHERE id = ?`,
      [
        Number(merged.category_id),
        String(merged.name).trim(),
        String(merged.slug).trim(),
        String(merged.sku).trim(),
        merged.description || '',
        Number(merged.price),
        Number(merged.original_price ?? merged.price),
        Number(merged.stock),
        merged.image_url || '',
        merged.material || '',
        merged.color || '',
        merged.saree_length || '',
        merged.blouse_piece || '',
        merged.is_featured,
        merged.is_active,
        id
      ]
    );

    return await getProductById({ id });
  } catch (error) {
    const safeMessage = getSafeErrorMessage(error.message);
    console.error('DATABASE IMAGE UPDATE ERROR:', safeMessage);
    if (error.code === 'ER_DUP_ENTRY') {
      throw new ApiError(409, 'A product with this slug or SKU already exists.', ['Duplicate product identifier.']);
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      throw new ApiError(400, 'Category not found.', ['The selected category does not exist.']);
    }
    const databaseError = new ApiError(500, safeMessage);
    databaseError.exposeSafeMessage = true;
    throw databaseError;
  }
};

const deleteProduct = async (DATA) => {
  const { id } = DATA;
  const existing = await getProductById({ id });

  await db.query('DELETE FROM products WHERE id = ?', [id]);
  return { deletedId: existing.id, deletedName: existing.name };
};

const setProductActivity = async (DATA) => {
  const { id, isActive } = DATA;
  const product = await getProductById({ id });
  await db.query('UPDATE products SET is_active = ?, updated_at = NOW() WHERE id = ?', [isActive ? 1 : 0, id]);
  return { ...product, is_active: isActive ? 1 : 0 };
};

return {
  getAllProducts,
  getProductById,
  getProductsByCategoryId,
  createProduct,
  updateProduct,
  deleteProduct,
  setProductActivity
};
};

module.exports = ProductService;
