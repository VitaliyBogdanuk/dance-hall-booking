"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, useToast, ToastContainer } from "@/components/ui";
import { apiPost, FetchError } from "@/lib/fetcher";

function RegisterForm() {
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      showToast("Password must be at least 8 characters", "error");
      setIsLoading(false);
      return;
    }

    try {
      const payload: Record<string, string> = {
        name: name.trim(),
        email: email.trim(),
        password,
      };

      if (phone.trim()) {
        payload.phone = phone.trim();
      }

      await apiPost("/api/auth/register", payload);
      
      showToast("Registration successful! Please sign in.", "success");
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      const error = err as FetchError;
      const errorMessage = error.message || "Registration failed. Please try again.";
      setError(errorMessage);
      showToast(errorMessage, "error");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Name"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              error={error}
            />
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <Input
              label="Phone (optional)"
              placeholder="+1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
            />
            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              helperText="Minimum 8 characters"
            />
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Sign Up
            </Button>
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <span>Already have an account? </span>
              <Link href="/login" className="text-accent hover:underline font-medium">
                Sign In
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
