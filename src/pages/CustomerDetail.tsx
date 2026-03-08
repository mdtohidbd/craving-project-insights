import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCustomerById } from "@/api/customers";
import { Customer, Contract } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Plus, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (customerId: string) => {
    try {
      setIsLoading(true);
      const data = await getCustomerById(customerId);
      if (data && data.customer) {
        setCustomer(data.customer);
        setContracts(data.contracts || []);
      } else {
        toast.error("কাস্টমার ডেটা পাওয়া যায়নি");
      }
    } catch (error: any) {
      console.error("Error loading customer:", error);
      if (error?.status === 404) {
        toast.error("কাস্টমার পাওয়া যায়নি");
      } else {
        toast.error("ডেটা লোড করতে সমস্যা হয়েছে");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">লোড হচ্ছে...</div>;
  }

  if (!customer) {
    return <div className="text-center py-8">কাস্টমার পাওয়া যায়নি</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate("/customers")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        কাস্টমার লিস্টে ফিরে যান
      </Button>

      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={customer.photo_url} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {customer.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{customer.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mt-2">
                <Phone className="h-4 w-4" />
                <a href={`tel:${customer.phone}`} className="hover:text-primary">
                  {customer.phone}
                </a>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <MapPin className="h-4 w-4" />
                <span>{customer.address}</span>
              </div>
              {customer.notes && (
                <p className="mt-3 text-sm text-muted-foreground">{customer.notes}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">বিক্রি (কিস্তি)</h2>
        <Button onClick={() => navigate(`/contracts/new?customer_id=${id}`)}>
          <Plus className="mr-2 h-4 w-4" />
          নতুন বিক্রি (কিস্তি)
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {contracts.map((contract) => (
          <Card
            key={contract._id}
            className="shadow-card hover:shadow-card-hover transition-smooth cursor-pointer"
            onClick={() => navigate(`/contracts/${contract._id}`)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{contract.product_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">মোট দাম:</span>
                <span className="font-semibold">৳{contract.product_price.toLocaleString("bn-BD")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">মোট কিস্তি:</span>
                <span>{contract.total_installments} টি</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">পরিশোধিত:</span>
                <span className="text-success">{contract.paid_installments} টি</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">বাকি:</span>
                <span className="text-destructive">
                  ৳{contract.remaining_amount.toLocaleString("bn-BD")}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
