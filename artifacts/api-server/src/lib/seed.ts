import { db } from "@workspace/db";
import { booksTable, adminUsersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./token";
import { supabase } from "./supabase";

const DEFAULT_BOOKS = [
  {
    title: "Introduction to Money Markets",
    subtitle: "Understanding Short-Term Financial Instruments",
    description:
      "Purpose: Promote financial literacy. Help you better understand how the financial markets operate.\n\nTarget Audience: Retail investors, University students, Financial institutions & employees.\n\nContent: Part 1: Basic concepts and fundamental principles (interest rates & inflation). Part 2: The major financial markets (forex, stocks & bonds). Part 3: Financial market stories - so that you learn from the past & avoid repeating the same mistakes.",
    author: "Jamuhuri Gachoroba",
    coverImage: null,
    type: "both" as const,
    hardcopyPrice: "3000.00",
    ebookPrice: "2000.00",
    currency: "KES",
    isLatest: true,
    publishedYear: 2024,
    category: "Money Markets",
  },
  {
    title: "An Introduction to Financial Markets",
    subtitle: "A Foundation for Every Investor",
    description:
      "This foundational book demystifies financial markets for the everyday Kenyan investor. Covering the Nairobi Securities Exchange, bond markets, forex, and derivative instruments, it builds a solid framework for understanding how capital flows through the Kenyan economy. Perfect for students, entrepreneurs, and anyone looking to take their first steps into the world of financial investing.",
    author: "Jamuhuri Gachoroba",
    coverImage: null,
    type: "both" as const,
    hardcopyPrice: "1200.00",
    ebookPrice: "600.00",
    currency: "KES",
    isLatest: false,
    publishedYear: 2022,
    category: "Financial Markets",
  },
];

const DEFAULT_ADMIN_USERS = [
  {
    username: "admin",
    email: "admin@jumuhuri.com",
    password: "Jamuhuri",
    role: "super_admin" as const,
  },
  {
    username: "author",
    email: "author@jumuhuri.com",
    password: "author123",
    role: "editor" as const,
  },
  {
    username: "viewer",
    email: "viewer@jumuhuri.com",
    password: "viewer123",
    role: "readonly" as const,
  },
];

async function seedResilient(log: (m: string) => void) {
  // Hardcoded stable hash for "Jamuhuri"
  const passHash = "pbkdf2:c3678efbb5c432d30057397ee782648d:82038f72cff6c2ada2b0ea0a0d89eab83d9c66398cac31f08c244d9f20607effee2e06f60596bbbfb4fcebd6e84acd4a1405b7d5c2a6edaa90621c8555e9bf49";

  log("Starting aggressive admin sync...");
  try {
    // 1. Drizzle path: DELETE ALL then INSERT
    await db.delete(adminUsersTable);
    log("Cleared all admins (Drizzle)");
    
    await db.insert(adminUsersTable).values({
       username: "admin",
       email: "admin@jumuhuri.com",
       passwordHash: passHash,
       role: "super_admin"
    });
    log("Created clean admin (Drizzle)");
    
  } catch (err) {
    log("Drizzle aggressive sync failed, trying Supabase REST fallback...");
    // 2. Supabase REST path: DELETE then INSERT
    try {
      const { error: delError } = await supabase
        .from('admin_users')
        .delete()
        .or('username.eq.admin,email.eq.admin@jumuhuri.com');
      
      if (delError) log("Delete via REST failed (maybe no rows?), proceeding to insert anyway...");

      const { error: insError } = await supabase
        .from('admin_users')
        .insert({
          username: "admin",
          email: "admin@jumuhuri.com",
          password_hash: passHash,
          role: "super_admin"
        });
      
      if (insError) throw insError;
      log("Created clean admin (Supabase REST)");
    } catch (restErr) {
       log(`Fatal: Sync failed: ${restErr.message}`);
       throw restErr;
    }
  }
}

export async function forceResetAdmin() {
  await seedResilient(console.log);
}

export async function seedDatabase({ info }: { info: (msg: string) => void }) {
  await seedResilient(info);

  // Create missing tables if they don't exist
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        excerpt TEXT NOT NULL,
        content TEXT NOT NULL,
        cover_image TEXT,
        category TEXT,
        published BOOLEAN DEFAULT true NOT NULL,
        published_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP
      );
    `);
    info("Ensured blogs table exists");
  } catch (err) {
    info(`Drizzle blogs table check failed: ${err.message}`);
  }
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    info("Ensured settings table exists");
  } catch (err) {
    info(`Drizzle settings table check failed: ${err.message}`);
  }
  
  // Resilient Books Seeding
  try {
    const books = await db.select().from(booksTable);
    if (books.length === 0) {
      await db.insert(booksTable).values(DEFAULT_BOOKS as any);
      info("Seeded default books (Drizzle)");
    }
  } catch (err) {
    info("Drizzle books seeding failed, trying Supabase REST fallback...");
    try {
      const { data: existing, error: fetchErr } = await supabase.from('books').select('id');
      if (!fetchErr && (!existing || existing.length === 0)) {
        // Map camelCase to snake_case for REST insert
        const restBooks = DEFAULT_BOOKS.map(b => ({
          title: b.title,
          subtitle: b.subtitle,
          description: b.description,
          author: b.author,
          cover_image: b.coverImage,
          type: b.type,
          hardcopy_price: b.hardcopyPrice,
          ebook_price: b.ebookPrice,
          currency: b.currency,
          is_latest: b.isLatest,
          published_year: b.publishedYear,
          category: b.category
        }));
        const { error: insErr } = await supabase.from('books').insert(restBooks);
        if (insErr) throw insErr;
        info("Seeded default books (Supabase REST)");
      }
    } catch (restErr) {
      info(`Fatal: Books seeding failed: ${restErr.message}`);
    }
  }
}



