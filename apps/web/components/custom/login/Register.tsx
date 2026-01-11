"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { User, Mail, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/* 🔧 FIX: schema aligned with backend */
const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register({ onToggle }: { onToggle: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);

    try {
      const res = await fetch(
        "/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (res.ok) {
        await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });
      } else {
        console.error("Registration failed");
      }
    } catch (error) {
      console.error("Registration failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-black overflow-hidden font-sans selection:bg-indigo-500/20">
      {/* Cinematic Radial Gradient Layers */}
      <div
        className="absolute top-[-10%] left-[-20%] w-[80vw] h-[80vh] rounded-full blur-[140px] opacity-[0.2] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, #4f46e5 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vh] rounded-full blur-[140px] opacity-[0.15] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, #7c3aed 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full flex justify-center px-4">
        {/* Large Central Radial Glow covering card + outside */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-30 pointer-events-none -z-10"
          style={{
            background:
              "radial-gradient(circle at center, #4f46e5 0%, #7c3aed 40%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />

        <div className="w-full max-w-[420px] p-10 bg-black/40 backdrop-blur-3xl border border-white/[0.1] rounded-3xl shadow-2xl relative flex flex-col gap-8">
          {/* Professional Radial Overlay */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at top left, rgba(79, 70, 229, 0.15), transparent 60%)",
            }}
          />
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />

          <div className="text-center space-y-2 relative z-10">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Sign Up
            </h1>
            <p className="text-zinc-500 text-sm">Create your account</p>
          </div>

          <div className="space-y-6 relative z-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
                    <Input
                      {...register("fullName")}
                      placeholder="Full Name"
                      className="pl-12 h-14 bg-white/[0.07] border-transparent text-white placeholder:text-zinc-500 rounded-full focus:ring-1 focus:ring-white/20 focus:bg-white/[0.1] hover:bg-white/[0.1] transition-all duration-300 font-light"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-xs ml-4 font-medium text-indigo-400">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
                    <Input
                      {...register("email")}
                      placeholder="Email"
                      type="email"
                      className="pl-12 h-14 bg-white/[0.07] border-transparent text-white placeholder:text-zinc-500 rounded-full focus:ring-1 focus:ring-white/20 focus:bg-white/[0.1] hover:bg-white/[0.1] transition-all duration-300 font-light"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs ml-4 font-medium text-indigo-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
                    <Input
                      {...register("password")}
                      type="password"
                      placeholder="Password"
                      className="pl-12 h-14 bg-white/[0.07] border-transparent text-white placeholder:text-zinc-500 rounded-full focus:ring-1 focus:ring-white/20 focus:bg-white/[0.1] hover:bg-white/[0.1] transition-all duration-300 font-light"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs ml-4 font-medium text-indigo-400">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-full text-base font-semibold text-white shadow-lg shadow-indigo-500/20 border-none transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                }}
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>

            <div className="text-center text-sm text-zinc-600">
              Already have an account?
              <button
                onClick={onToggle}
                className="hover:underline focus:outline-none font-medium ml-1 transition-all hover:opacity-80"
                style={{
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
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
