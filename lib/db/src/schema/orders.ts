import { pgTable, text, serial, timestamp, real, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  address: text("address").notNull(),
  items: jsonb("items").notNull().default([]),
  total: real("total").notNull(),
  status: text("status").notNull().default("pending"), // pending | processing | shipped | delivered | cancelled
  paymentStatus: text("payment_status").notNull().default("pending"), // pending | verified | failed
  paymentMethod: text("payment_method").notNull().default("bank-transfer"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;

// Cart items stored in session — no DB table needed
export interface CartItemType {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string | null;
}
