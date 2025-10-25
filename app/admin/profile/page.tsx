"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Memoized PasswordInput component
  const PasswordInput = useCallback(
    ({
      name,
      value,
      onChange,
      showPassword,
      setShowPassword,
      placeholder,
    }: {
      name: string;
      value: string;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      showPassword: boolean;
      setShowPassword: (show: boolean) => void;
      placeholder?: string;
    }) => (
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
    ),
    []
  );

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      const session = (data as any)?.session;
      if (!session) return router.replace("/admin/login");
    };
    check();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (
        !formData.currentPassword ||
        !formData.newPassword ||
        !formData.confirmPassword
      ) {
        toast.error("Please fill in all fields");
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }

      if (formData.newPassword.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }

      // Update password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (error) {
        console.error("Password update error:", error);

        if (error.message.includes("password")) {
          toast.error("Invalid current password");
        } else {
          toast.error("Failed to update password: " + error.message);
        }
        return;
      }

      // Success
      toast.success("Password updated successfully!");

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin — Profile</h1>

        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Update Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <PasswordInput
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  showPassword={showCurrentPassword}
                  setShowPassword={setShowCurrentPassword}
                  placeholder="Enter current password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <PasswordInput
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  showPassword={showNewPassword}
                  setShowPassword={setShowNewPassword}
                  placeholder="Enter new password"
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <PasswordInput
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  showPassword={showConfirmPassword}
                  setShowPassword={setShowConfirmPassword}
                  placeholder="Confirm new password"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Profile Information */}
        <Card className="max-w-md mt-6">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>Your authenticated email</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last login:</span>
                <span>Recently</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account type:</span>
                <span>Administrator</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
