import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  price: real("price").notNull(),
  inventory: integer("inventory").notNull().default(0),
  description: text("description").notNull().default(""),
  image: text("image").notNull().default(""),
  deliveryDays: integer("delivery_days").notNull().default(5),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  userName: text("user_name"),
  userAddress: text("user_address"),
  deliveryDate: text("delivery_date").notNull(),
  status: text("status").notNull().default("confirmed"),
  createdAt: text("created_at").notNull(),
});
