import ProfileForm from '@/components/custom/profile/ProfileForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Profile | AI Integration Platform',
    description: 'Manage your user profile'
};

export default function ProfilePage() {
    return (
        <div className="min-h-screen w-full bg-black relative overflow-hidden font-sans selection:bg-indigo-500/20">
            {/* Shared Cinematic Background Elements (Similar to Login but toned down) */}
            <div
                className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vh] rounded-full blur-[120px] opacity-[0.15] pointer-events-none"
                style={{ background: 'radial-gradient(circle at center, #4f46e5 0%, transparent 70%)' }}
            />
            <div
                className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vh] rounded-full blur-[120px] opacity-[0.1] pointer-events-none"
                style={{ background: 'radial-gradient(circle at center, #7c3aed 0%, transparent 70%)' }}
            />

            <div className="relative z-10 container mx-auto px-4 py-8">
                <div className="mb-8">
                    <Link
                        href="/chatbot"
                        className="inline-flex items-center text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Chat
                    </Link>
                </div>

                <div className="flex justify-center">
                    <ProfileForm />
                </div>
            </div>
        </div>
    );
}
