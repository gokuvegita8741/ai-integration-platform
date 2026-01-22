import PricingCards from '@/components/custom/pricing/PricingCards';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pricing | AI Integration Platform',
    description: 'Choose the plan that fits your needs'
};

export default function PricingPage() {
    return (
        <div className="min-h-screen w-full bg-black relative overflow-hidden font-sans selection:bg-indigo-500/20">
            {/* Shared Cinematic Background Elements */}
            <div
                className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] rounded-full blur-[140px] opacity-[0.25] pointer-events-none"
                style={{ background: 'radial-gradient(circle at center, #4f46e5 0%, #7c3aed 40%, transparent 70%)' }}
            />
            <div
                className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vh] rounded-full blur-[120px] opacity-[0.1] pointer-events-none"
                style={{ background: 'radial-gradient(circle at center, #7c3aed 0%, transparent 70%)' }}
            />

            <div className="relative z-10 container mx-auto px-4 py-8 pb-20">
                <div className="mb-12">
                    <Link
                        href="/chatbot"
                        className="inline-flex items-center text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Chat
                    </Link>
                </div>

                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-2">
                        <Sparkles className="h-3 w-3" />
                        Pricing Plans
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                        Unlock the Full Power of AI
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Choose the perfect plan to accelerate your workflow. Upgrade anytime as you scale.
                    </p>
                </div>

                <PricingCards />
            </div>
        </div>
    );
}
