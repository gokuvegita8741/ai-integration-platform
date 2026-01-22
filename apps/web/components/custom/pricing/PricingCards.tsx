'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../../ui/badge';
import { notifications } from '@mantine/notifications';
import { Check, Sparkles, Zap, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface PricingTier {
    name: string;
    description: string;
    price: string;
    features: string[];
    highlight?: boolean;
    cta: string;
    icon: React.ElementType;
}

const tiers: PricingTier[] = [
    {
        name: 'Starter',
        description: 'For individuals exploring AI capabilities.',
        price: 'Free',
        features: [
            'Access to basic AI models',
            '50 queries per day',
            'Standard support',
            'Community access',
        ],
        cta: 'Get Started',
        icon: Zap,
    },
    {
        name: 'Pro',
        description: 'For professionals requiring advanced tools.',
        price: '$29',
        features: [
            'Access to all AI models',
            'Unlimited queries',
            'Priority support',
            'Early access to new features',
            'Custom integrations',
        ],
        highlight: true,
        cta: 'Upgrade to Pro',
        icon: Sparkles,
    },
    {
        name: 'Enterprise',
        description: 'For teams and large organizations.',
        price: 'Custom',
        features: [
            'Dedicated infrastructure',
            'SSO & Advanced Security',
            '24/7 Dedicated Support',
            'SLA guarantees',
            'Custom AI model fine-tuning',
        ],
        cta: 'Contact Sales',
        icon: Shield,
    },
];

export default function PricingCards() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleAction = async (tierName: string) => {
        setIsLoading(tierName);

        // Simulate API/Processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsLoading(null);

        if (tierName === 'Enterprise') {
            notifications.show({
                title: 'Inquiry Sent',
                message: 'Our sales team will contact you shortly.',
                color: 'blue',
            });
            return;
        }

        notifications.show({
            title: 'Success!',
            message: `You have successfully selected the ${tierName} plan.`,
            color: 'green',
        });

        // Mock redirect appropriately
        // router.push('/dashboard'); 
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl mx-auto px-4">
            {tiers.map((tier) => (
                <div
                    key={tier.name}
                    className={cn(
                        "relative group",
                        tier.highlight ? "md:-mt-4 md:mb-4 sm:mb-0" : ""
                    )}
                >
                    {/* Glow Effect for Highlighted Tier */}
                    {tier.highlight && (
                        <div
                            className="absolute -inset-[1px] rounded-[24px] bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-500 blur-sm opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                            aria-hidden="true"
                        />
                    )}

                    <Card className={cn(
                        "h-full relative overflow-hidden transition-all duration-300 border-white/10 bg-black/40 backdrop-blur-xl flex flex-col",
                        tier.highlight ? "shadow-2xl shadow-indigo-500/20" : "hover:border-white/20 hover:bg-black/50"
                    )}>
                        {/* Inner Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

                        <CardHeader>
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn(
                                    "p-3 rounded-2xl",
                                    tier.highlight ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-zinc-400"
                                )}>
                                    <tier.icon className="h-6 w-6" />
                                </div>
                                {tier.highlight && (
                                    <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-none">
                                        Most Popular
                                    </Badge>
                                )}
                            </div>
                            <CardTitle className="text-2xl font-bold text-white mb-2">{tier.name}</CardTitle>
                            <CardDescription className="text-zinc-400 h-10">{tier.description}</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6 flex-1">
                            <div className="flex items-baseline text-white">
                                <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                                {tier.price !== 'Custom' && tier.price !== 'Free' && (
                                    <span className="text-lg text-zinc-500 ml-1">/month</span>
                                )}
                            </div>

                            <ul className="space-y-3">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-start text-sm text-zinc-300">
                                        <Check className="h-4 w-4 text-indigo-500 mr-2 shrink-0 mt-0.5" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>

                        <CardFooter>
                            <Button
                                className={cn(
                                    "w-full h-11 rounded-lg font-semibold transition-all duration-300",
                                    tier.highlight
                                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25"
                                        : "bg-white/10 hover:bg-white/20 text-white"
                                )}
                                onClick={() => handleAction(tier.name)}
                                disabled={!!isLoading}
                            >
                                {isLoading === tier.name ? (
                                    'Processing...'
                                ) : (
                                    tier.cta
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            ))}
        </div>
    );
}
