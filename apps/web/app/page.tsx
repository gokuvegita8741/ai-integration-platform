import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { isTokenExpired } from "@/lib/checkToken";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if(!session || !session?.accessToken || isTokenExpired(session.accessToken)){
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col items-center bg-gradient-to-b from-white/[0.05] to-transparent selection:bg-indigo-500/20 justify-center min-h-screen p-8 font-[family-name:var(--font-geist-sans)]"
    style={{ background: 'radial-gradient(circle at center, #4f46e5 0%, transparent 100%)' }}
    >
      <h1 className="text-4xl font-bold mb-4 text-white">Welcome to AI Integration Platform</h1>
      <p className="text-xl mb-8 text-white">
        Hello, <span className="font-semibold">{session.user?.name}</span> ({session.user?.email})
      </p>
      <LogoutButton />
    </div>
  );
}

