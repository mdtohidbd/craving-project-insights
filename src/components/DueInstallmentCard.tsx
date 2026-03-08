import { useState } from "react";
import { InstallmentWithDetails } from "@/types";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { markInstallmentPaid } from "@/api/installments";
import { toast } from "sonner";
import { Phone, MapPin, Package, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  data: InstallmentWithDetails;
  onPaid: (installmentId: string) => void;
}

export function DueInstallmentCard({ data, onPaid }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { installment, customer, contract } = data;

  const handleMarkPaid = async () => {
    setIsLoading(true);
    try {
      await markInstallmentPaid(installment._id);
      toast.success(
        "কিস্তি সফলভাবে Paid হিসেবে সংরক্ষণ হয়েছে।",
        {
          action: {
            label: "কিস্তির ডিটেইল দেখতে এখানে ক্লিক করুন",
            onClick: () => navigate(`/contracts/${contract._id}`)
          },
          duration: 10000
        }
      );
      setIsDialogOpen(false);
      onPaid(installment._id);
    } catch (error) {
      toast.error("সমস্যা হয়েছে, আবার চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  };

  const formatInstallmentNo = (no: number) => {
    const banglaNumbers = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    const suffix = ["ম", "য়", "তম"][Math.min(no - 1, 2)];
    return no.toString().split("").map(d => banglaNumbers[parseInt(d)]).join("") + suffix + " কিস্তি";
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const isOverdue = new Date(installment.due_date) < new Date();

  return (
    <>
      <Card className={`shadow-card hover:shadow-card-hover transition-smooth ${isOverdue ? "border-destructive" : ""}`}>
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

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">প্রোডাক্ট:</span>
                  <span className="font-medium">{contract.product_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">কিস্তি:</span>{" "}
                  <span className="font-medium">{formatInstallmentNo(installment.installment_no)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">এই কিস্তি:</span>{" "}
                  <span className="font-semibold text-lg">৳{installment.amount.toLocaleString("bn-BD")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">ডিউ:</span>{" "}
                  <span className={isOverdue ? "text-destructive font-medium" : ""}>
                    {formatDate(installment.due_date)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">বাকি কিস্তি:</span>{" "}
                  <span className="font-medium">{contract.remaining_installments} টি</span>
                </div>
                <div>
                  <span className="text-muted-foreground">বাকি টাকা:</span>{" "}
                  <span className="font-medium">৳{contract.remaining_amount.toLocaleString("bn-BD")}</span>
                </div>
              </div>

              <Button onClick={() => setIsDialogOpen(true)} className="w-full" size="sm">
                Paid মার্ক করুন
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>কিস্তি পরিশোধ কনফার্মেশন</DialogTitle>
            <DialogDescription>
              আপনি কি নিশ্চিত যে <strong>{customer.name}</strong>-এর{" "}
              <strong>{formatInstallmentNo(installment.installment_no)}</strong> এর টাকা পেয়েছেন?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              বাতিল করুন
            </Button>
            <Button onClick={handleMarkPaid} disabled={isLoading}>
              {isLoading ? "সেভ হচ্ছে..." : "নিশ্চিত করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
