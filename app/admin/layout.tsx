import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Sidebar from "@/components/admin/sidebar";
import Navbar from "@/components/admin/navbar";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (
    !session ||
    !session.user ||
    !session.user.id ||
    !session.sessionToken ||
    !session.accessToken ||
    session.user.role !== "admin"
  ) {
    redirect("/404");
  }
  const dbSession = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.sessionToken, session.sessionToken),
        eq(sessions.accessToken, session.accessToken),
      ),
    )
    .limit(1);

  const existingSession = dbSession[0];
  if (!existingSession) {
    redirect("/404");
  }

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-[#080c14] via-[#0b0f15] to-[#080c14] text-white">
        <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[280px_1fr]">
          <Sidebar />

          {/* MAIN CONTENT */}
          <main className="flex min-w-0 flex-col">
            <Navbar />
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
