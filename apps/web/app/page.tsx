import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { isTokenExpired } from "@/lib/checkToken";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/auth/login");
  }

  // Unreachable code, but keeping structure for now
  return null;
}

