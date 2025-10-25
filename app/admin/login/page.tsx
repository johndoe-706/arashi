"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting login with:", { email });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      console.debug("Supabase auth response:", { data, error });

      if (error) {
        console.error("Auth error details:", error);

        // More specific error messages
        if (error.message.includes("Invalid login credentials")) {
          toast.error(
            "Invalid email or password. Please check your credentials."
          );
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Please confirm your email address before logging in.");
        } else {
          toast.error(error.message || "Login failed");
        }
        return;
      }

      // Check if we have a valid session and user
      if (data?.session && data?.user) {
        console.log("Login successful, user:", data.user.email);
        toast.success("Logged in successfully");
        router.push("/admin");
        router.refresh(); // Refresh to update auth state
      } else {
        console.warn("No session after login:", data);
        toast.error("Login incomplete. Please try again.");
      }
    } catch (err: any) {
      console.error("Unexpected login error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
