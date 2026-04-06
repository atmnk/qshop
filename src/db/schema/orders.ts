import { pgTable, text, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { users } from "./users";
import { products } from "./products";

export const orders = pgTable("orders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  buyerId: text("buyer_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  status: text("status", {
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded"],
  })
    .notNull()
    .default("pending"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  shippingAddress: text("shipping_address"),
  paymentId: text("payment_id"),
  paymentStatus: text("payment_status", {
    enum: ["pending", "paid", "failed", "refunded"],
  })
    .notNull()
    .default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
