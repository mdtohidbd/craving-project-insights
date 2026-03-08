import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCustomers } from "@/api/customers";
import { createContract } from "@/api/contracts";
import { Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export default function ContractNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get("customer_id");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: customerId || "",
    product_name: "",
    product_price: "",
    sale_date: new Date().toISOString().split("T")[0],
    total_installments: "9",
    notes: "",
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      toast.error("কাস্টমার লোড করতে সমস্যা হয়েছে");
    }
  };

  const estimatedInstallment = formData.product_price && formData.total_installments
    ? Math.round(parseFloat(formData.product_price) / parseInt(formData.total_installments))
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        customer_id: formData.customer_id,
        product_name: formData.product_name,
        product_price: parseFloat(formData.product_price),
        sale_date: formData.sale_date,
        total_installments: parseInt(formData.total_installments),
        notes: formData.notes || undefined,
      };

      const result = await createContract(payload);
      toast.success("কিস্তি প্ল্যান সফলভাবে তৈরি হয়েছে।");
      navigate(`/contracts/${result._id}`);
    } catch (error) {
      toast.error("কিস্তি প্ল্যান তৈরি করতে সমস্যা হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        ফিরে যান
      </Button>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>নতুন বিক্রি (কিস্তি প্ল্যান) তৈরি করুন</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer">কাস্টমার নির্বাচন করুন *</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, customer_id: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="একটি কাস্টমার নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {customers.map((customer) => (
                    <SelectItem key={customer._id} value={customer._id}>
                      {customer.name} - {customer.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_name">প্রোডাক্ট নাম *</Label>
              <Input
                id="product_name"
                required
                value={formData.product_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, product_name: e.target.value }))
                }
                placeholder="যেমন: ব্যাটারি ভ্যান"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_price">মোট মূল্য (৳) *</Label>
              <Input
                id="product_price"
                type="number"
                required
                min="0"
                value={formData.product_price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, product_price: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale_date">বিক্রির তারিখ *</Label>
              <Input
                id="sale_date"
                type="date"
                required
                value={formData.sale_date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, sale_date: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_installments">কিস্তি সংখ্যা (মাস) *</Label>
              <Select
                value={formData.total_installments}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, total_installments: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {Array.from({ length: 10 }, (_, i) => i + 3).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} মাস
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {estimatedInstallment > 0 && (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm font-medium">
                  প্রতি কিস্তির আনুমানিক পরিমাণ:{" "}
                  <span className="text-lg text-primary">
                    ৳{estimatedInstallment.toLocaleString("bn-BD")}
                  </span>
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">নোট</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                বাতিল করুন
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "তৈরি হচ্ছে..." : "তৈরি করুন"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
