"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PageHeader,
  Card,
  CardContent,
  Button,
  Input,
  useToast,
  ToastContainer,
  Spinner,
} from "@/components/ui";
import { apiGet, apiPatch, FetchError } from "@/lib/fetcher";

interface Profile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export default function ProfilePage() {
  const { toasts, showToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<Profile>("/api/profile");
      setProfile(data);
      setForm({
        name: data.name,
        email: data.email,
        password: "",
        phone: data.phone || "",
      });
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      showToast("Name and email are required", "error");
      return;
    }

    if (form.password && form.password.length < 8) {
      showToast("Password must be at least 8 characters", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Record<string, string> = {
        name: form.name.trim(),
        email: form.email.trim(),
      };

      if (form.password.trim()) {
        payload.password = form.password;
      }
      if (form.phone.trim()) {
        payload.phone = form.phone.trim();
      } else {
        payload.phone = "";
      }

      const updated = await apiPatch<Profile>("/api/profile", payload);
      setProfile(updated);
      setForm({ ...form, password: "" });
      showToast("Profile updated successfully", "success");
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to update profile", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 pb-20">
      <PageHeader title="My Profile" description="Manage your account information" />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-4 space-y-4">
            <Input
              label="Name"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              disabled={isSubmitting}
            />
            <Input
              type="email"
              label="Email"
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              disabled={isSubmitting}
            />
            <Input
              label="Phone (optional)"
              placeholder="+1234567890"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              disabled={isSubmitting}
            />
            <Input
              type="password"
              label="New Password (leave empty to keep current)"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={isSubmitting}
              helperText="Leave empty to keep current password. Minimum 8 characters if changing."
            />
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
