import { ContractWithCustomer } from "@/types";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { Phone, MapPin } from "lucide-react";

interface Props {
  data: ContractWithCustomer;
}

export function ContractCard({ data }: Props) {
  const { contract, customer, ui_status } = data;
  const navigate = useNavigate();

  const statusConfig = {
    GREEN: { label: "সম্পূর্ণ পরিশোধ", className: "bg-success text-success-foreground" },
    YELLOW: { label: "কিস্তি চলছে", className: "bg-warning text-warning-foreground" },
    RED: { label: "ডিউ কিস্তি আছে", className: "bg-destructive text-destructive-foreground" },
  };

  const status = statusConfig[ui_status];

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-smooth relative">
      <Badge className={`absolute top-4 right-4 ${status.className}`}>
        {status.label}
      </Badge>

      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={customer.photo_url} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {customer.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-lg">{customer.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Phone className="h-3 w-3" />
                <a href={`tel:${customer.phone}`} className="hover:text-primary">
                  {customer.phone}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                <span>{customer.address}</span>
              </div>
            </div>

            <div className="space-y-1 text-sm border-t border-border pt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">প্রোডাক্ট:</span>
                <span className="font-medium">{contract.product_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">বিক্রির তারিখ:</span>
                <span className="font-medium">
                  {contract.sale_date ? new Date(contract.sale_date).toLocaleDateString("bn-BD", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
                  }) : "N/A"}
                </span>
              </div>
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
                <span className="text-success font-medium">{contract.paid_installments} টি</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">বাকি কিস্তি:</span>
                <span className="text-warning font-medium">{contract.remaining_installments} টি</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">বাকি টাকা:</span>
                <span className="font-semibold text-destructive">
                  ৳{contract.remaining_amount.toLocaleString("bn-BD")}
                </span>
              </div>
              {contract.next_installment_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">পরবর্তী কিস্তির তারিখ:</span>
                  <span className="font-medium text-warning">
                    {new Date(contract.next_installment_date).toLocaleDateString("bn-BD", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit"
                    })}
                  </span>
                </div>
              )}
            </div>

            <Button
              onClick={() => navigate(`/contracts/${contract._id}`)}
              variant="outline"
              className="w-full"
              size="sm"
            >
              ডিটেইল দেখুন
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
