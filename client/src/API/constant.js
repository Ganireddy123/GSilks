const hostname = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const publicEndPoints = new Map([
  ["register", { path: "/auth/register", methods: ["post"] }],
  ["login", { path: "/auth/login", methods: ["post"] }],
  ["getCategories", { path: "/category/get-categories", methods: ["get"] }],
  ["getCategoryById", { path: "/category/get-category/:id", methods: ["get"] }],
  ["getProducts", { path: "/product/get-products", methods: ["get"] }],
  ["getProductById", { path: "/product/get-product/:id", methods: ["get"] }],
  ["getProductsByCategory", { path: "/product/get-products-by-category/:id", methods: ["get"] }],
  ["searchProducts", { path: "/product/search-products", methods: ["get"] }],
]);

export const privateEndPoints = new Map([
  ["getProfile", { path: "/auth/profile", methods: ["get"] }],
  ["updateProfile", { path: "/auth/update-profile", methods: ["put"] }],
  ["changePassword", { path: "/auth/change-password", methods: ["put"] }],
  ["insertCategory", { path: "/category/insert-category", methods: ["post"] }],
  ["updateCategory", { path: "/category/:id", methods: ["put"] }],
  ["deleteCategory", { path: "/category/:id", methods: ["delete"] }],
  ["insertProduct", { path: "/product/insert-product", methods: ["post"] }],
  ["updateProduct", { path: "/product/update-product", methods: ["put"] }],
  ["deleteProduct", { path: "/product/:id", methods: ["delete"] }],
  ["getCart", { path: "/cart/get-cart", methods: ["get"] }],
  ["addToCart", { path: "/cart/add-to-cart", methods: ["post"] }],
  ["updateCart", { path: "/cart/update-cart", methods: ["put"] }],
  ["removeFromCart", { path: "/cart/items/:id", methods: ["delete"] }],
  ["clearCart", { path: "/cart/clear-cart", methods: ["put"] }],
  ["createOrder", { path: "/order/create-order", methods: ["post"] }],
  ["getMyOrders", { path: "/order/get-my-orders", methods: ["get"] }],
  ["getOrder", { path: "/order/get-order/:id", methods: ["get"] }],
  ["cancelOrder", { path: "/order/cancel-order", methods: ["put"] }],
  ["adminGetOrders", { path: "/order/admin/get-orders", methods: ["get"] }],
  ["adminGetOrder", { path: "/order/admin/get-order/:id", methods: ["get"] }],
  ["adminUpdateOrderStatus", { path: "/order/admin/update-order-status", methods: ["put"] }],
  ["getUserProfile", { path: "/user/get-profile", methods: ["get"] }],
  ["updateUserProfile", { path: "/user/update-profile", methods: ["put"] }],
  ["userChangePassword", { path: "/user/change-password", methods: ["put"] }],
  ["adminGetUsers", { path: "/user/admin/get-users", methods: ["get"] }],
  ["adminGetUser", { path: "/user/admin/get-user/:id", methods: ["get"] }],
  ["adminUpdateUserStatus", { path: "/user/admin/update-user-status", methods: ["put"] }],
  ["adminDashboard", { path: "/admin/dashboard", methods: ["get"] }],
  ["adminProducts", { path: "/admin/products", methods: ["get"] }],
  ["adminCategories", { path: "/admin/categories", methods: ["get"] }],
  ["adminOrders", { path: "/admin/orders", methods: ["get"] }],
  ["adminUsers", { path: "/admin/users", methods: ["get"] }],
]);

export default { hostname, publicEndPoints, privateEndPoints };