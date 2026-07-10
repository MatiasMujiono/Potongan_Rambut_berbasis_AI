import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { ArgonService } from "@/lib/argon";

async function seed() {
  try {
    console.log("🌱 Seeding users...");

    // Hash password
    const passwordHash = await ArgonService.hash("123");

    const seedUsers = [
      {
        id: crypto.randomUUID(),
        email: "admin@gmail.com",
        password: passwordHash,
        role: "admin",
      },
      {
        id: crypto.randomUUID(),
        email: "user@example.com",
        password: passwordHash,
        role: "user",
      },
    ];

    for (const user of seedUsers) {
      const existing = await db.query.users.findFirst({
        where: eq(users.email, user.email),
      });

      if (!existing) {
        await db.insert(users).values(user);
        console.log(`✅ Inserted: ${user.email}`);
      } else {
        console.log(`⚠️ Skipped (exists): ${user.email}`);
      }
    }

    console.log("🎉 Seeding selesai!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding gagal:", error);
    process.exit(1);
  }
}

seed();
