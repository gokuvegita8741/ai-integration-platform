'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { notifications } from '@mantine/notifications';
import { User, Mail, Save, UserCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm() {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        reset,
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: session?.user?.name || '',
            email: session?.user?.email || '',
            bio: 'AI Enthusiast & Developer',
        },
    });

    // Reset form when session loads
    useEffect(() => {
        if (session?.user) {
            reset({
                name: session.user.name || '',
                email: session.user.email || '',
                bio: 'AI Enthusiast & Developer',
            });
        }
    }, [session, reset]);

    // Navigation Guard - Browser Back/Refresh/Close
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                const message = 'You have unsaved changes. Are you sure you want to leave?';
                e.preventDefault();
                e.returnValue = message; // Standard for most browsers
                return message;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);


    // Next.js Navigation Guard (Experimental/Workaround)
    // Note: Completely blocking internal navigation in Next.js App Router 
    // is tricky without intercepting all Link clicks. 
    // For now, we rely on the browser's beforeunload for hard navigations
    // and we inject a popstate listener for back buttons.
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (isDirty) {
                const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
                if (!confirmed) {
                    // Push state back to prevent navigation
                    window.history.pushState(null, '', window.location.href);
                }
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isDirty]);

    // Intercept internal Link clicks
    useEffect(() => {
        const handleAnchorClick = (e: MouseEvent) => {
            if (isDirty) {
                const target = e.target as HTMLElement;
                const anchor = target.closest('a');
                if (anchor) {
                    // Check if it's a local link (not external) control/meta clicks usually open new tab so ignore
                    if (anchor.target === '_blank' || e.metaKey || e.ctrlKey) return;

                    const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
                    if (!confirmed) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
            }
        };

        window.addEventListener('click', handleAnchorClick, true); // true = capture phase
        return () => window.removeEventListener('click', handleAnchorClick, true);
    }, [isDirty]);

    const onSubmit = async (data: ProfileFormValues) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsLoading(false);
        reset(data); // Reset dirty state

        notifications.show({
            title: 'Profile Updated',
            message: 'Your changes have been saved successfully.',
            color: 'green',
        });
    };

    return (
        <Card className="w-full max-w-2xl bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <UserCircle className="h-6 w-6 text-indigo-500" />
                    Profile Settings
                </CardTitle>
                <CardDescription className="text-zinc-400">
                    Manage your account settings and preferences.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex flex-col items-center space-y-4">
                        <Avatar className="h-24 w-24 border-2 border-indigo-500/20">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.email || 'user'}`} />
                            <AvatarFallback>
                                {session?.user?.name?.substring(0, 2).toUpperCase() || 'US'}
                            </AvatarFallback>
                        </Avatar>
                        <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10 text-xs">
                            Change Avatar
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-zinc-300">Display Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                <Input
                                    id="name"
                                    {...register('name')}
                                    className="pl-9 bg-white/5 border-white/10 text-white focus:ring-indigo-500/50"
                                    placeholder="Your Name"
                                />
                            </div>
                            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                <Input
                                    id="email"
                                    {...register('email')}
                                    className="pl-9 bg-white/5 border-white/10 text-white focus:ring-indigo-500/50"
                                    placeholder="you@example.com"
                                    readOnly // Often email is immutable or requires specific flow
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio" className="text-zinc-300">Bio</Label>
                            <Input
                                id="bio"
                                {...register('bio')}
                                className="bg-white/5 border-white/10 text-white focus:ring-indigo-500/50"
                                placeholder="Tell us about yourself"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            {isDirty && (
                                <span className="text-amber-400 text-xs mr-4 self-center animate-pulse">
                                    Unsaved changes
                                </span>
                            )}
                            <Button
                                type="submit"
                                disabled={isLoading || !isDirty}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                {isLoading ? (
                                    'Saving...'
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" /> Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}
