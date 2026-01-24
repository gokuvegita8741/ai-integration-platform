import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfilePage } from "@/components/profile/ProfilePage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profile - QuickGPT",
    description: "Manage your profile and subscription.",
};

export default async function Page() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    // Cast user to the expected type, ensuring we handle potential null/undefined from session
    const user = {
        name: session.user?.name || null,
        email: session.user?.email || null,
        image: session.user?.image || null,
    };

    return <ProfilePage user={user} />;
}
