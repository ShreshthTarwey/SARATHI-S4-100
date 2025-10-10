"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        {[
          { icon: "🌟", delay: "0s", color: "text-sunny-yellow" },
          { icon: "💫", delay: "1s", color: "text-sky-blue" },
          { icon: "✨", delay: "2s", color: "text-mint-green" },
          { icon: "🎯", delay: "3s", color: "text-coral-pink" },
          { icon: "🚀", delay: "4s", color: "text-soft-lavender" },
        ].map((item, i) => (
          <div
            key={i}
            className={`absolute animate-float-object-${(i % 3) + 1} opacity-20`}
            style={{
              left: `${10 + i * 20}%`,
              top: `${15 + i * 15}%`,
              animationDelay: item.delay,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          >
            <div className="bg-white/30 backdrop-blur-sm rounded-full p-3 shadow-lg">
              <span className={`text-3xl ${item.color}`}>{item.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Back to home button */}
          <Link
            href="/"
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <Card className="bg-white/95 backdrop-blur-sm border-2 border-primary/20 shadow-2xl card-glow">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="animate-sparkle-dance">
                  <Sparkles className="w-12 h-12 text-primary" />
                </div>
              </div>
              <CardTitle className="font-heading text-3xl font-bold bg-gradient-to-r from-primary via-accent to-coral-pink bg-clip-text text-transparent">
                Welcome Back!
              </CardTitle>
              <p className="font-body text-muted-foreground mt-2">
                Sign in to continue your learning journey
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-destructive text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-body font-medium text-foreground">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-2 border-primary/20 focus:border-primary transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-body font-medium text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 border-2 border-primary/20 focus:border-primary transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-primary to-accent text-white font-body font-semibold text-lg rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="auth-loading mr-3"></div>
                      Signing In...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="font-body text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    href="/auth/signup"
                    className="text-primary hover:text-accent font-semibold transition-colors"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
