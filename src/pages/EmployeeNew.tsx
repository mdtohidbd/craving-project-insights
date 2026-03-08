import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEmployee } from "@/api/employees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function EmployeeNew() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    roleLabel: "",
    username: "",
    pin: "",
    photo_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createEmployee(formData);
      toast.success("এমপ্লয়ি সফলভাবে যুক্ত হয়েছে।");
      navigate("/employees");
    } catch (error) {
      toast.error("এমপ্লয়ি যুক্ত করতে সমস্যা হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    "বিক্রয় প্রতিনিধি",
    "সেলস ম্যানেজার",
    "কাস্টমার সার্ভিস",
    "অ্যাকাউন্টেন্ট",
    "ম্যানেজার",
    "সুপারভাইজার",
    "অন্যান্য"
  ];

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Button variant="ghost" onClick={() => navigate("/employees")} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        এমপ্লয়ি লিস্টে ফিরে যান
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>নতুন এমপ্লয়ি যুক্ত করুন</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="photo_url">এমপ্লয়ির ছবি (URL)</Label>
              <Input
                id="photo_url"
                type="url"
                value={formData.photo_url}
                onChange={(e) => setFormData((prev) => ({ ...prev, photo_url: e.target.value }))}
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">নাম *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">মোবাইল *</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleLabel">রোল *</Label>
              <Select
                value={formData.roleLabel}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, roleLabel: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="রোল নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">ইউজারনেম *</Label>
              <Input
                id="username"
                required
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin">PIN (৪-৬ ডিজিট) *</Label>
              <Input
                id="pin"
                type="password"
                required
                minLength={4}
                maxLength={6}
                value={formData.pin}
                onChange={(e) => setFormData((prev) => ({ ...prev, pin: e.target.value }))}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/employees")}>
                বাতিল করুন
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "সেভ হচ্ছে..." : "সেভ করুন"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
