import { pgTable, text, timestamp, numeric, integer, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";

export const products = pgTable("products", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sellerId: text("seller_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  stock: integer("stock").notNull().default(0),
  images: text("images").array().notNull().default([]),
  category: text("category"),
  dodoProductId: text("dodo_product_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
