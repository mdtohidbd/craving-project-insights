import { useEffect, useState } from "react";
import { getSmsSettings, updateSmsSettings } from "@/api/settings";
import { SmsSettings as SmsSettingsType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function SmsSettings() {
  const [settings, setSettings] = useState<SmsSettingsType>({
    sms_enabled: false,
    sms_provider: "",
    sms_api_key: "",
    sms_sender_id: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSmsSettings();
      setSettings(data);
    } catch (error) {
      toast.error("SMS সেটিংস লোড করতে সমস্যা হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateSmsSettings(settings);
      toast.success("SMS সেটিংস সফলভাবে সংরক্ষিত হয়েছে!");
    } catch (error) {
      toast.error("SMS সেটিংস সংরক্ষণে সমস্যা হয়েছে");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">লোড হচ্ছে...</div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">SMS সেটিংস</h1>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>SMS কনফিগারেশন</CardTitle>
          <CardDescription>
            স্বয়ংক্রিয় SMS বিজ্ঞপ্তির জন্য আপনার SMS প্রোভাইডার সেটআপ করুন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <Label htmlFor="sms_enabled" className="flex-1">
                SMS চালু করবেন?
              </Label>
              <Switch
                id="sms_enabled"
                checked={settings.sms_enabled}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, sms_enabled: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sms_provider">প্রোভাইডার</Label>
              <Input
                id="sms_provider"
                value={settings.sms_provider}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, sms_provider: e.target.value }))
                }
                placeholder="যেমন: BulkSMS, Twilio"
                disabled={!settings.sms_enabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sms_api_key">API Key</Label>
              <Input
                id="sms_api_key"
                type="password"
                value={settings.sms_api_key}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, sms_api_key: e.target.value }))
                }
                disabled={!settings.sms_enabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sms_sender_id">Sender ID</Label>
              <Input
                id="sms_sender_id"
                value={settings.sms_sender_id}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, sms_sender_id: e.target.value }))
                }
                placeholder="যেমন: LEVKISTI"
                disabled={!settings.sms_enabled}
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
