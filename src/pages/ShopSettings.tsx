import { useEffect, useState } from "react";
import { getShopSettings, updateShopSettings } from "@/api/settings";
import { ShopSettings as ShopSettingsType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ShopSettings() {
  const [settings, setSettings] = useState<ShopSettingsType>({
    name: "",
    address: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getShopSettings();
      setSettings(data);
    } catch (error) {
      toast.error("সেটিংস লোড করতে সমস্যা হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateShopSettings(settings);
      toast.success("সেটিংস সফলভাবে সংরক্ষিত হয়েছে!");
      // Dispatch event to update shop name in Layout
      window.dispatchEvent(new Event('shopSettingsUpdated'));
    } catch (error) {
      toast.error("সেটিংস সংরক্ষণে সমস্যা হয়েছে");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">লোড হচ্ছে...</div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">দোকান সেটিংস</h1>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>দোকানের তথ্য</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">দোকানের নাম</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => setSettings((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">ঠিকানা</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => setSettings((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">মোবাইল নম্বর</Label>
              <Input
                id="phone"
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? "সেভ হচ্ছে..." : "সেভ করুন"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
