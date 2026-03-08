import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEmployees, updateEmployee } from "@/api/employees";
import { Employee } from "@/types";
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

export default function EmployeeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    roleLabel: "",
    pin: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    photo_url: "",
  });

  useEffect(() => {
    if (id) {
      loadEmployee(id);
    }
  }, [id]);

  const loadEmployee = async (employeeId: string) => {
    try {
      const employees = await getEmployees();
      const emp = employees.find((e) => e._id === employeeId);
      if (emp) {
        setEmployee(emp);
        setFormData({
          name: emp.name,
          phone: emp.phone,
          roleLabel: emp.roleLabel,
          pin: "",
          status: emp.status,
          photo_url: emp.photo_url || "",
        });
      }
    } catch (error) {
      toast.error("এমপ্লয়ি ডেটা লোড করতে সমস্যা হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSaving(true);

    try {
      const payload: any = {
        name: formData.name,
        phone: formData.phone,
        roleLabel: formData.roleLabel,
        status: formData.status,
        photo_url: formData.photo_url || undefined,
      };

      if (formData.pin) {
        payload.pin = formData.pin;
      }

      await updateEmployee(id, payload);
      toast.success("এমপ্লয়ি তথ্য আপডেট হয়েছে।");
      navigate("/employees");
    } catch (error) {
      toast.error("এমপ্লয়ি আপডেট করতে সমস্যা হয়েছে");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">লোড হচ্ছে...</div>;
  }

  if (!employee) {
    return <div className="text-center py-8">এমপ্লয়ি পাওয়া যায়নি</div>;
  }

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
          <CardTitle>এমপ্লয়ি এডিট করুন</CardTitle>
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
              <Label htmlFor="pin">নতুন PIN (খালি রাখুন যদি পরিবর্তন না করতে চান)</Label>
              <Input
                id="pin"
                type="password"
                minLength={4}
                maxLength={6}
                value={formData.pin}
                onChange={(e) => setFormData((prev) => ({ ...prev, pin: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">স্ট্যাটাস *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "ACTIVE" | "INACTIVE") =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="ACTIVE">সক্রিয়</SelectItem>
                  <SelectItem value="INACTIVE">নিষ্ক্রিয়</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/employees")}>
                বাতিল করুন
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "সেভ হচ্ছে..." : "আপডেট করুন"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
