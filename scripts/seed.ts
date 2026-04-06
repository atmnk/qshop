import { config } from "dotenv";
config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { users, accounts, products } from "../src/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// ---------------------------------------------------------------------------
// Sellers
// ---------------------------------------------------------------------------
const SELLERS = [
  {
    id: "seller-1",
    name: "TechGadgets Store",
    email: "techgadgets@qshop.dev",
    password: "password123",
    role: "seller" as const,
  },
  {
    id: "seller-2",
    name: "StyleHub Fashion",
    email: "stylehub@qshop.dev",
    password: "password123",
    role: "seller" as const,
  },
  {
    id: "seller-3",
    name: "Home & Living Co.",
    email: "homeliving@qshop.dev",
    password: "password123",
    role: "seller" as const,
  },
];

// ---------------------------------------------------------------------------
// Products  (Unsplash URLs – no download, hotlink allowed)
// ---------------------------------------------------------------------------
const PRODUCTS = [
  // ── Electronics ──────────────────────────────────────────────────────────
  {
    sellerId: "seller-1",
    name: "Sony WH-1000XM5 Wireless Headphones",
    description:
      "Industry-leading noise cancelling headphones with up to 30 hours battery life, crystal-clear hands-free calling, and Alexa voice control.",
    price: "349.99",
    stock: 42,
    category: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
    ],
  },
  {
    sellerId: "seller-1",
    name: "Apple MacBook Pro 14-inch",
    description:
      "Supercharged by the M3 Pro chip. With a stunning Liquid Retina XDR display, all-day battery life and a thin, light design.",
    price: "1999.00",
    stock: 15,
    category: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
    ],
  },
  {
    sellerId: "seller-1",
    name: "iPhone 15 Pro Max",
    description:
      "Titanium design. A17 Pro chip. Pro camera system with 5× Telephoto. USB 3 speeds. Action button.",
    price: "1199.00",
    stock: 30,
    category: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
      "https://images.unsplash.com/photo-1592950630581-03cb41342cc5?w=800&q=80",
    ],
  },
  {
    sellerId: "seller-1",
    name: "Sony Alpha A7 III Mirrorless Camera",
    description:
      "Full-frame mirrorless camera with 24.2 MP back-illuminated CMOS sensor, 4K video recording, and 693-point phase-detection AF.",
    price: "1999.99",
    stock: 8,
    category: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
      "https://images.unsplash.com/photo-1502920917128-1aa500764b60?w=800&q=80",
    ],
  },
  {
    sellerId: "seller-1",
    name: "Mechanical Gaming Keyboard",
    description:
      "TKL compact layout with Cherry MX Red switches. RGB per-key backlighting. Aircraft-grade aluminum frame.",
    price: "129.99",
    stock: 60,
    category: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
      "https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=800&q=80",
    ],
  },
  {
    sellerId: "seller-1",
    name: "Samsung 65\" QLED 4K Smart TV",
    description:
      "Quantum Dot technology for a billion shades of brilliant color. Real Game Enhancer, Ambient Mode, and built-in voice assistants.",
    price: "1299.99",
    stock: 10,
    category: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=800&q=80",
      "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&q=80",
    ],
  },
  {
    sellerId: "seller-1",
    name: "Apple Watch Series 9",
    description:
      "All-new S9 SiP chip. Brighter Always-On Retina display. New double tap gesture. Advanced health sensors.",
    price: "399.99",
    stock: 55,
    category: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80",
    ],
  },

  // ── Clothing ──────────────────────────────────────────────────────────────
  {
    sellerId: "seller-2",
    name: "Classic White Oxford Shirt",
    description:
      "Premium 100% cotton Oxford shirt. Button-down collar, chest pocket, and a relaxed fit perfect for casual or smart-casual wear.",
    price: "49.99",
    stock: 120,
    category: "Clothing",
    images: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    ],
  },
  {
    sellerId: "seller-2",
    name: "Nike Air Max 270",
    description:
      "The Nike Air Max 270 features the biggest Max Air unit yet for a super-soft ride that feels as impossible as it looks.",
    price: "149.99",
    stock: 85,
    category: "Clothing",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&q=80",
    ],
  },
  {
    sellerId: "seller-2",
    name: "Slim-Fit Stretch Denim Jeans",
    description:
      "Made with our signature stretch fabric that moves with you all day. Mid-rise, slim fit through thigh and leg.",
    price: "79.99",
    stock: 95,
    category: "Clothing",
    images: [
      "https://images.unsplash.com/photo-1542219550-37153d387c27?w=800&q=80",
      "https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=800&q=80",
    ],
  },
  {
    sellerId: "seller-2",
    name: "Patagonia Down Puffer Jacket",
    description:
      "Certified Responsible Down Standard 800-fill-power down insulation. Windproof and water-resistant shell. Packable into its own chest pocket.",
    price: "229.00",
    stock: 40,
    category: "Clothing",
    images: [
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80",
      "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=800&q=80",
    ],
  },
  {
    sellerId: "seller-2",
    name: "Linen Summer Dress",
    description:
      "Breathable 100% European linen. Relaxed fit with adjustable tie waist. Available in 6 earthy tones.",
    price: "89.00",
    stock: 70,
    category: "Clothing",
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
    ],
  },

  // ── Home ──────────────────────────────────────────────────────────────────
  {
    sellerId: "seller-3",
    name: "Minimal Concrete Table Lamp",
    description:
      "Handcrafted concrete base with warm Edison bulb. Matte finish. Perfect for bedside tables and reading nooks.",
    price: "69.99",
    stock: 35,
    category: "Home",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
      "https://images.unsplash.com/photo-1513506003901-1e6a35c6bb4b?w=800&q=80",
    ],
  },
  {
    sellerId: "seller-3",
    name: "Indoor Monstera Deliciosa Plant",
    description:
      "Comes in a 6-inch ceramic pot. Easy-care tropical houseplant, perfect for bright indirect light.",
    price: "34.99",
    stock: 50,
    category: "Home",
    images: [
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80",
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
    ],
  },
  {
    sellerId: "seller-3",
    name: "Scented Soy Candle Set (3-pack)",
    description:
      "Hand-poured soy wax candles. Scents: Cedarwood & Amber, Lavender Fields, Fresh Linen. 40-hour burn time each.",
    price: "44.99",
    stock: 80,
    category: "Home",
    images: [
      "https://images.unsplash.com/photo-1603905016522-b8e286b87f8e?w=800&q=80",
      "https://images.unsplash.com/photo-1602607157006-61b1e6e4ad07?w=800&q=80",
    ],
  },
  {
    sellerId: "seller-3",
    name: "Bamboo Cutting Board Set",
    description:
      "Set of 3 eco-friendly bamboo boards with juice groove. Naturally antimicrobial. Dishwasher safe.",
    price: "39.99",
    stock: 65,
    category: "Home",
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
      "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80",
    ],
  },

  // ── Sports ────────────────────────────────────────────────────────────────
  {
    sellerId: "seller-3",
    name: "Lululemon The Mat 5mm Yoga Mat",
    description:
      "Our best-selling mat with dense 5mm cushioning for joint support. Antimicrobial additive and non-slip surface.",
    price: "98.00",
    stock: 45,
    category: "Sports",
    images: [
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    ],
  },
  {
    sellerId: "seller-3",
    name: "Neoprene Hex Dumbbell Set (5–25 lb)",
    description:
      "Set of 5 pairs of neoprene coated dumbbells (5, 10, 15, 20, 25 lb) with solid chrome steel handles.",
    price: "189.99",
    stock: 20,
    category: "Sports",
    images: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80",
    ],
  },
  {
    sellerId: "seller-1",
    name: "Hydro Flask 32 oz Water Bottle",
    description:
      "TempShield insulation keeps drinks cold 24 hours, hot 12 hours. Durable 18/8 stainless steel. Lifetime warranty.",
    price: "49.95",
    stock: 110,
    category: "Sports",
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80",
    ],
  },

  // ── Books ─────────────────────────────────────────────────────────────────
  {
    sellerId: "seller-2",
    name: "Atomic Habits by James Clear",
    description:
      "The life-changing million-copy #1 bestseller. Tiny Changes, Remarkable Results. An Easy & Proven Way to Build Good Habits & Break Bad Ones.",
    price: "17.99",
    stock: 200,
    category: "Books",
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
    ],
  },
  {
    sellerId: "seller-2",
    name: "The Design of Everyday Things",
    description:
      "Don Norman's seminal book on user-centred design. A must-read for designers, engineers, and anyone who wonders why some products frustrate us.",
    price: "19.99",
    stock: 80,
    category: "Books",
    images: [
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80",
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80",
    ],
  },
];

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------
async function seed() {
  console.log("🌱  Seeding database…\n");

  // Sellers
  for (const seller of SELLERS) {
    const existing = await db.select().from(users).where(eq(users.email, seller.email));
    if (existing.length > 0) {
      console.log(`  ⏭  Seller already exists: ${seller.email}`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(seller.password, 10);

    await db.insert(users).values({
      id: seller.id,
      name: seller.name,
      email: seller.email,
      emailVerified: true,
      role: seller.role,
    });

    await db.insert(accounts).values({
      id: `account-${seller.id}`,
      accountId: seller.id,
      providerId: "credential",
      userId: seller.id,
      password: hashedPassword,
    });

    console.log(`  ✅  Created seller: ${seller.name} (${seller.email})`);
  }

  console.log();

  // Products
  let created = 0;
  let skipped = 0;
  for (const product of PRODUCTS) {
    const existing = await db
      .select()
      .from(products)
      .where(eq(products.name, product.name));

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    await db.insert(products).values({
      id: crypto.randomUUID(),
      sellerId: product.sellerId,
      name: product.name,
      description: product.description,
      price: product.price,
      currency: "USD",
      stock: product.stock,
      category: product.category,
      images: product.images,
      isActive: true,
    });

    console.log(`  ✅  ${product.category.padEnd(12)} ${product.name}`);
    created++;
  }

  if (skipped > 0) console.log(`\n  ⏭  Skipped ${skipped} already-existing products.`);

  console.log(`\n✨  Done! Created ${created} products across ${SELLERS.length} sellers.\n`);
  console.log("  Seller logins (password: password123)");
  for (const s of SELLERS) console.log(`    ${s.email}`);
  console.log();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
