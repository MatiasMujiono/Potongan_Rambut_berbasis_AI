import "./globals.css";
import SessionManager from "@/components/SessionManager";
import Navbar from "@/components/navbar";
import { SessionProvider } from "next-auth/react";

export const metadata = {
  title: "HairMatch AI | Rekomendasi Gaya Rambut",
  description: "Temukan gaya rambut terbaik berdasarkan bentuk wajahmu.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-50 min-h-screen text-slate-800 font-sans antialiased">
        <SessionProvider>
          <SessionManager>
            <Navbar />
            <main className="w-full h-full">{children}</main>
          </SessionManager>
        </SessionProvider>
      </body>
    </html>
  );
}
