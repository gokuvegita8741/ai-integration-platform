'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Mail, Lock, EyeOff, Eye } from 'lucide-react';
import Register from './Register';
import { notifications } from '@mantine/notifications';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);

        try {
            const result = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.ok) {
                notifications.show({
                    title: 'Success',
                    message: 'Login successful! Redirecting...',
                    color: 'green',
                    position: 'top-right',
                });
                router.push('/');
            } else {
                // Extract error message from result
                const errorMessage = result?.error || 'Invalid email or password';
                notifications.show({
                    title: 'Login Failed',
                    message: errorMessage,
                    color: 'red',
                    position: 'top-right',
                });
            }
        } catch (error: any) {
            console.error('Login failed', error);
            notifications.show({
                title: 'Error',
                message: error.message || 'An unexpected error occurred',
                color: 'red',
                position: 'top-right',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isRegistering) {
        return <Register onToggle={() => setIsRegistering(false)} />;
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative bg-black overflow-hidden font-sans selection:bg-indigo-500/20">
            {/* Cinematic Radial Gradient Layers */}
            <div
                className="absolute top-[-10%] left-[-20%] w-[80vw] h-[80vh] rounded-full blur-[140px] opacity-[0.2] pointer-events-none animate-pulse-slow"
                style={{ background: 'radial-gradient(circle at center, #4f46e5 0%, transparent 70%)' }}
            />
            <div
                className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vh] rounded-full blur-[140px] opacity-[0.15] pointer-events-none"
                style={{ background: 'radial-gradient(circle at center, #7c3aed 0%, transparent 70%)' }}
            />

            <div className="relative z-10 w-full flex justify-center px-4">
                {/* Large Central Radial Glow covering card + outside */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-30 pointer-events-none -z-10"
                    style={{
                        background: 'radial-gradient(circle at center, #4f46e5 0%, #7c3aed 40%, transparent 70%)',
                        filter: 'blur(100px)'
                    }}
                />

                <div className="w-full max-w-[420px] p-10 bg-black/40 backdrop-blur-3xl border border-white/[0.1] rounded-3xl shadow-2xl relative flex flex-col gap-8">
                    {/* Professional Radial Overlay */}
                    <div
                        className="absolute inset-0 rounded-3xl pointer-events-none"
                        style={{ background: 'radial-gradient(circle at top left, rgba(79, 70, 229, 0.15), transparent 60%)' }}
                    />
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />

                    <div className="text-center space-y-2 relative z-10">
                        <h1 className="text-3xl font-bold text-white tracking-tight">Login</h1>
                        <p className="text-zinc-500 text-sm">Please sign in to continue</p>
                    </div>

                    <div className="space-y-6 relative z-10">
                        {/* Google Sign In - Visual only */}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Email"
                                            {...register('email')}
                                            className="pl-12 h-14 bg-white/[0.07] border-transparent text-white placeholder:text-zinc-500 rounded-full focus:outline-none focus-visible:ring-2 hover:bg-white/[0.1] transition-all duration-300 font-light"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p
                                            className="text-xs ml-4 font-medium"
                                            style={{
                                                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text',
                                                color: 'transparent'
                                            }}
                                        >
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Password"
                                            {...register('password')}
                                            className="pl-12 h-14 bg-white/[0.07] border-transparent text-white placeholder:text-zinc-500 rounded-full focus:outline-none focus-visible:ring-2 hover:bg-white/[0.1] transition-all duration-300 font-light"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p
                                            className="text-xs ml-4 font-medium"
                                            style={{
                                                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text',
                                                color: 'transparent'
                                            }}
                                        >
                                            {errors.password.message}
                                        </p>
                                    )}
                                    <div className="flex justify-end px-2">
                                        <a href="#" className="text-xs text-zinc-500 hover:text-white transition-colors">
                                            Forgot password?
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 rounded-full text-base font-semibold text-white shadow-lg shadow-indigo-500/20 border-none transition-all duration-300 hover:-translate-y-0.5"
                                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </Button>
                        </form>

                        <div className="text-center text-sm text-zinc-600">
                            Don&apos;t have an account?{' '}
                            <button
                                onClick={() => setIsRegistering(true)}
                                className="hover:underline focus:outline-none font-medium ml-1 transition-all hover:opacity-80"
                                style={{
                                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    color: 'transparent'
                                }}
                            >
                                click here
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
