import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-4xl font-bold mb-4">Welcome to AI Integration Platform</h1>
      <p className="text-xl mb-8">
        Hello, <span className="font-semibold">{session.user?.name}</span> ({session.user?.email})
      </p>
      <LogoutButton />
    </div>
  );
}

