import { useEffect, useState } from "react";
import { updateOwnerProfile } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function ProfileSettings() {
  const { user, setUser } = useAuth();
  const [ownerProfile, setOwnerProfile] = useState({
    name: "",
    username: "",
    password: "",
    currentPassword: "",
    confirmPassword: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setOwnerProfile({
        name: user.name || "",
        username: user.username || "",
        password: "",
        currentPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password if changing
    if (ownerProfile.password) {
      if (!ownerProfile.currentPassword) {
        toast.error("বর্তমান পাসওয়ার্ড দিন");
        return;
      }
      if (ownerProfile.password !== ownerProfile.confirmPassword) {
        toast.error("নতুন পাসওয়ার্ড মিলছে না");
        return;
      }
      if (ownerProfile.password.length < 6) {
        toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
        return;
      }
    }

    setIsSavingProfile(true);

    try {
      const payload: any = {};
      if (ownerProfile.name !== user?.name) {
        payload.name = ownerProfile.name;
      }
      if (ownerProfile.username && ownerProfile.username !== user?.username) {
        payload.username = ownerProfile.username;
      }
      if (ownerProfile.password) {
        payload.password = ownerProfile.password;
        payload.currentPassword = ownerProfile.currentPassword;
      }

      if (Object.keys(payload).length === 0) {
        toast.info("কোন পরিবর্তন করা হয়নি");
        setIsSavingProfile(false);
        return;
      }

      const updatedUser = await updateOwnerProfile(payload);
      
      // Update user in context and localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const newUserData = { ...userData, ...updatedUser };
        localStorage.setItem("user", JSON.stringify(newUserData));
        setUser(newUserData);
      }

      toast.success("প্রোফাইল সফলভাবে আপডেট হয়েছে!");
      
      // Reset password fields
      setOwnerProfile((prev) => ({
        ...prev,
        password: "",
        currentPassword: "",
        confirmPassword: "",
      }));
    } catch (error: any) {
      const errorMessage = error.message || "প্রোফাইল আপডেটে সমস্যা হয়েছে";
      toast.error(errorMessage);
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (!user) {
    return <div className="text-center py-8">লোড হচ্ছে...</div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">প্রোফাইল সেটিংস</h1>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>মালিকের প্রোফাইল</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="owner-name">নাম</Label>
              <Input
                id="owner-name"
                value={ownerProfile.name}
                onChange={(e) => setOwnerProfile((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner-username">ইউজারনেম</Label>
              <Input
                id="owner-username"
                value={ownerProfile.username}
                onChange={(e) => setOwnerProfile((prev) => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current-password">বর্তমান পাসওয়ার্ড (পাসওয়ার্ড পরিবর্তনের জন্য)</Label>
              <Input
                id="current-password"
                type="password"
                value={ownerProfile.currentPassword}
                onChange={(e) => setOwnerProfile((prev) => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="পাসওয়ার্ড পরিবর্তন করতে হলে দিন"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">নতুন পাসওয়ার্ড</Label>
              <Input
                id="new-password"
                type="password"
                value={ownerProfile.password}
                onChange={(e) => setOwnerProfile((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="পাসওয়ার্ড পরিবর্তন করতে হলে দিন"
              />
            </div>

            {ownerProfile.password && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password">পাসওয়ার্ড নিশ্চিত করুন</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={ownerProfile.confirmPassword}
                  onChange={(e) => setOwnerProfile((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="পাসওয়ার্ড নিশ্চিত করুন"
                />
              </div>
            )}

            <Button type="submit" disabled={isSavingProfile}>
              {isSavingProfile ? "সেভ হচ্ছে..." : "প্রোফাইল আপডেট করুন"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

