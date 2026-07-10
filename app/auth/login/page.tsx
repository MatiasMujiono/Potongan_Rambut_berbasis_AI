import AuthLoginClient from ".";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthLoginServer() {
  const session = await auth();

  const roleRedirectMap: Record<string, string> = {
    admin: "/admin/dashboard",
    superadmin: "/superadmin",
    user: "/",
  };

  const role = session?.user?.role;

  role && roleRedirectMap[role] && redirect(roleRedirectMap[role]);
  return <AuthLoginClient />;
}
