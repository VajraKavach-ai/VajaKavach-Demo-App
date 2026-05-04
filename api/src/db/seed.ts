import { db } from "./index.ts";
import { products } from "./schema.ts";
import { count } from "drizzle-orm";

const demoProducts = [
  { name: "Demo Product 1", price: 19.99, inventory: 10, description: "A sample product for demo.", image: "/products/product-1.svg", deliveryDays: 5 },
  { name: "Demo Product 2", price: 29.99, inventory: 5, description: "Another sample product.", image: "/products/product-2.svg", deliveryDays: 5 },
  { name: "Demo Product 3", price: 9.99, inventory: 20, description: "Affordable demo item.", image: "/products/product-3.svg", deliveryDays: 4 },
  { name: "Demo Product 4", price: 49.99, inventory: 7, description: "Premium demo product.", image: "/products/product-4.svg", deliveryDays: 7 },
  { name: "Demo Product 5", price: 15.99, inventory: 15, description: "Popular demo item.", image: "/products/product-5.svg", deliveryDays: 3 },
  { name: "Demo Product 6", price: 24.99, inventory: 8, description: "Limited edition demo.", image: "/products/product-6.svg", deliveryDays: 6 },
  { name: "Demo Product 7", price: 12.49, inventory: 12, description: "Budget-friendly demo.", image: "/products/product-7.svg", deliveryDays: 4 },
  { name: "Demo Product 8", price: 34.99, inventory: 9, description: "Feature-rich demo product.", image: "/products/product-8.svg", deliveryDays: 5 },
  { name: "Demo Product 9", price: 27.99, inventory: 6, description: "Stylish demo item.", image: "/products/product-9.svg", deliveryDays: 5 },
  { name: "Demo Product 10", price: 39.99, inventory: 11, description: "Top-rated demo product.", image: "/products/product-10.svg", deliveryDays: 6 },
  { name: "Demo Product 11", price: 17.99, inventory: 13, description: "Eco-friendly demo.", image: "/products/product-11.svg", deliveryDays: 4 },
  { name: "Demo Product 12", price: 22.99, inventory: 10, description: "Best value demo.", image: "/products/product-12.svg", deliveryDays: 5 },
];

export function seed() {
  const [{ total }] = db.select({ total: count() }).from(products).all();
  if (total === 0) {
    console.log("[DB] Seeding demo products...");
    db.insert(products).values(demoProducts).run();
    console.log(`[DB] Seeded ${demoProducts.length} products.`);
  } else {
    console.log(`[DB] Products table already has ${total} rows, skipping seed.`);
  }
}
