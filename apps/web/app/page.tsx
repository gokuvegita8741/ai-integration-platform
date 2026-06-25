import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  console.log("SESSION_MAIN_PAGE",session);

  if (!session) {
    redirect("/auth/login");
  }

  if (Date.now() > session.accessTokenExpires) {
    redirect("/auth/logout");
  }

  if (session) {
    redirect("/dashboard");
  }

  redirect("/auth/login");

  // Unreachable code, but keeping structure for now
  return null;
}

