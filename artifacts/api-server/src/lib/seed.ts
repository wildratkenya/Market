import { db } from "@workspace/db";
import { booksTable, adminUsersTable } from "@workspace/db/schema";
import { hashPassword } from "./token";

const DEFAULT_BOOKS = [
  {
    title: "Introduction to Money Markets",
    subtitle: "Understanding Short-Term Financial Instruments",
    description:
      "A comprehensive guide to money markets, covering Treasury Bills, commercial paper, certificates of deposit, and repurchase agreements. This book explains how money markets function in Kenya and globally, their role in monetary policy, and how individual and institutional investors can participate effectively. Written for both beginners and finance professionals seeking to deepen their understanding of short-term financial instruments.",
    author: "Jamuhuri Gachoroba",
    coverImage: null,
    type: "both" as const,
    hardcopyPrice: "1500.00",
    ebookPrice: "800.00",
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
    email: "Admin@jumuhuri.com",
    password: "J@muhuri",
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

export async function seedDatabase(logger?: { info: (msg: string) => void }) {
  const log = (msg: string) => logger?.info(msg) ?? console.log(msg);

  const books = await db.select().from(booksTable);
  if (books.length === 0) {
    await db.insert(booksTable).values(DEFAULT_BOOKS);
    log("Seeded default books");
  }

  const adminUsers = await db.select().from(adminUsersTable);
  if (adminUsers.length === 0) {
    const usersToInsert = DEFAULT_ADMIN_USERS.map(({ username, email, password, role }) => ({
      username,
      email,
      passwordHash: hashPassword(password),
      role,
    }));
    await db.insert(adminUsersTable).values(usersToInsert);
    log("Seeded default admin users");
  }
}
