import "./instrumentation.ts";
import express from "express";
import { existsSync } from "fs";
import { join } from "path";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { runMigrations } from "./db/migrate.ts";
import { seed } from "./db/seed.ts";
import { db } from "./db/index.ts";
import { products as productsTable, orders as ordersTable } from "./db/schema.ts";
import { eq } from "drizzle-orm";
import { logger } from "./utils/logger.js";
import { loggingMiddleware } from "./middleware/logging.js";

// Run migrations and seed on startup
logger.info("Starting API server...");
runMigrations();
seed();
logger.info("Migrations and seed completed");

const app = express();
const port = Number(process.env.PORT) || 5000;

// Apply logging middleware
app.use(loggingMiddleware);
app.use(express.json());

// Receive logs from frontend
app.post("/api/logs", (req, res) => {
  const { level = "info", message, meta, timestamp } = req.body;
  logger.frontend(level, message, { meta, timestamp });
  res.json({ status: "ok" });
});

// --- API Endpoints ---

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Get all products
 *     responses:
 *       200:
 *         description: List of products
 */
app.get("/api/products", (req, res) => {
  logger.info("Fetching all products");
  // --- MCP_DEMO_PERFORMANCE_NO_PAGINATION: Uncomment to remove pagination limit ---
  // const allProducts = db.select().from(productsTable).all(); // Returns all without limit
  
  // Production version with pagination
  const limit = 100; // Hard limit to prevent abuse
  const allProducts = db.select().from(productsTable).limit(limit).all();
  res.json(allProducts);
});

// Create order (with user/address, quantity, fake payment)
app.post("/api/orders", (req, res) => {
  const startTime = Date.now();
  const { productId, quantity, user } = req.body;

  // --- MCP_DEMO_NULL_POINTER: Uncomment to crash on null dereference ---
  let x: any = null; x.foo = 1; // Crashes when triggered

  // --- MCP_DEMO_MEMORY_LEAK: Uncomment to create unbounded global array ---
  // (global as any).leakArray = (global as any).leakArray || [];
  // (global as any).leakArray.push(new Array(1000000).fill('leak')); // Grows by 1MB per order

  // --- MCP_DEMO_SECURITY_UNSANITIZED_INPUT: Uncomment to accept XSS in user input ---
  // const maliciousName = user?.name; // No sanitization, could inject HTML/JS

  // --- MCP_DEMO_PERFORMANCE_N_PLUS_ONE: Uncomment to make N+1 queries for items ---
  // for (let i = 0; i < quantity; i++) {
  //   const [p] = db.select().from(productsTable).where(eq(productsTable.id, productId)).all();
  // } // Makes separate query per quantity instead of single batch operation

  const [product] = db.select().from(productsTable).where(eq(productsTable.id, productId)).all();
  if (!product) {
    logger.warn(`Order failed: Product not found (id=${productId})`, { productId });
    return res.status(404).json({ error: "Product not found" });
  }
  if (quantity > product.inventory) {
    logger.warn(`Order failed: Insufficient inventory for product ${productId}`, { productId, requested: quantity, available: product.inventory });
    return res.status(400).json({ error: "Insufficient inventory" });
  }
  // Reduce inventory
  db.update(productsTable)
    .set({ inventory: product.inventory - quantity })
    .where(eq(productsTable.id, productId))
    .run();
  // Calculate delivery date
  const deliveryDate = new Date(Date.now() + (product.deliveryDays || 5) * 86400000).toISOString();
  const [order] = db.insert(ordersTable).values({
    productId,
    quantity,
    userName: user?.name || null,
    userAddress: user?.address || null,
    deliveryDate,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  }).returning().all();
  const duration = Date.now() - startTime;
  logger.info(`Order placed`, { orderId: order.id, productId, quantity });
  logger.performance(`POST /api/orders`, duration, { orderId: order.id });
  res.json({ order, message: "Order placed successfully (fake payment processed)" });
});

// Update product/inventory (admin, password protected)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "demo123";
app.put("/api/products/:id", (req, res) => {
  const { password, ...update } = req.body;
  
  // --- MCP_DEMO_SECURITY_EVAL: Uncomment to enable code injection via eval() ---
  // eval(`console.log('MCP_DEMO_EVAL_INJECTION: Password is ' + ${JSON.stringify(password)})`);

  // --- MCP_DEMO_SECURITY_PASSWORD_LOGGING: Uncomment to log passwords to access logs ---
  logger.audit("Product update attempt", "admin", { password, productId: req.params.id }); // Exposes password!

  // --- MCP_DEMO_SECURITY_NO_INPUT_VALIDATION: Uncomment to skip validation ---
  // db.update(productsTable).set(update as any).where(eq(productsTable.id, parseInt(req.params.id))).run();
  // return res.json({ product: update, message: "Updated (no validation)" });

  if (password !== ADMIN_PASSWORD) {
    logger.audit("FAILED product update attempt", "unauthorized", { productId: req.params.id });
    return res.status(401).json({ error: "Unauthorized: Invalid password" });
  }
  
  logger.audit("Product update", "admin", { productId: req.params.id, fieldsUpdated: Object.keys(update) });
  
  const productId = parseInt(req.params.id);
  const [product] = db.select().from(productsTable).where(eq(productsTable.id, productId)).all();
  if (!product) {
    logger.warn(`Product update failed: Product not found (id=${req.params.id})`, { productId });
    return res.status(404).json({ error: "Product not found" });
  }
  
  // --- MCP_DEMO_PERFORMANCE_MULTIPLE_QUERIES: Uncomment to make 3 queries instead of 1 ---
  // const [old] = db.select().from(productsTable).where(eq(productsTable.id, productId)).all(); // Query 1
  // const [prev] = db.select().from(productsTable).where(eq(productsTable.id, productId)).all(); // Query 2 (duplicate)
  
  const updateData: Record<string, unknown> = {};
  if (update.name !== undefined) updateData.name = update.name;
  if (update.price !== undefined) updateData.price = update.price;
  if (update.inventory !== undefined) updateData.inventory = update.inventory;
  if (update.description !== undefined) updateData.description = update.description;
  if (update.image !== undefined) updateData.image = update.image;
  if (update.deliveryDays !== undefined) updateData.deliveryDays = update.deliveryDays;

  db.update(productsTable).set(updateData).where(eq(productsTable.id, productId)).run();
  const [updated] = db.select().from(productsTable).where(eq(productsTable.id, productId)).all();
  logger.info(`Product updated`, { productId, updated });
  res.json({ product: updated, message: "Product updated" });
});

// Reset demo data
app.post("/api/reset-demo", (req, res) => {
  const { password } = req.body;
  
  // --- MCP_DEMO_SECURITY_HARDCODED_PASSWORD: Uncomment to use hardcoded password ---
  // const BACKDOOR_PASSWORD = "backdoor123"; // Hardcoded backdoor!
  // if (password === BACKDOOR_PASSWORD) {
  //   logger.audit("BACKDOOR reset by suspicious user", "backdoor", {});
  //   db.delete(ordersTable).run();
  //   db.delete(productsTable).run();
  //   seed();
  //   return res.json({ message: "Data reset via backdoor" });
  // }
  
  if (password !== ADMIN_PASSWORD) {
    logger.audit("FAILED reset attempt", "unauthorized", {});
    return res.status(401).json({ error: "Unauthorized: Invalid password" });
  }
  
  logger.audit("Reset demo data", "admin", {});
  
  // --- MCP_DEMO_MEMORY_UNBOUNDED_CACHE: Uncomment to accumulate cache ---
  // (global as any).dataCache = (global as any).dataCache || [];
  // (global as any).dataCache.push({ timestamp: Date.now(), data: "never cleared" }); // Grows forever
  
  db.delete(ordersTable).run();
  db.delete(productsTable).run();
  seed();
  logger.info(`Demo data reset`);
  res.json({ message: "Demo data reset" });
});

app.get("/health", (_req, res) => {
  logger.info("Health check");
  res.send("Healthy");
});

// Serve static files from the "static" directory if it exists (used in publish/deploy mode
// when the frontend's build output is bundled into this container via publishWithContainerFiles)
const staticDir = join(import.meta.dirname, "..", "static");
if (existsSync(staticDir)) {
  app.use(express.static(staticDir));
}

// Swagger documentation
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "Ecommerce Demo API", version: "1.0.0" }
  },
  apis: ["./src/index.ts"]
});
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, () => {
  logger.info(`API server listening on port ${port}`);
});
