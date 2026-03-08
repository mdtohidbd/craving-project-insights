import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getContractById } from "@/api/contracts";
import { markInstallmentPaid } from "@/api/installments";
import { Contract, Customer, Installment } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (contractId: string) => {
    try {
      const data = await getContractById(contractId);
      setContract(data.contract);
      setCustomer(data.customer);
      setInstallments(data.installments);
    } catch (error) {
      toast.error("ডেটা লোড করতে সমস্যা হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!selectedInstallment) return;

    setIsPaying(true);
    try {
      await markInstallmentPaid(selectedInstallment._id);
      toast.success(
        "কিস্তি সফলভাবে Paid হিসেবে সংরক্ষণ হয়েছে।",
        {
          action: {
            label: "কিস্তির ডিটেইল দেখতে এখানে ক্লিক করুন",
            onClick: () => {
              // Scroll to the installment table or refresh the view
              window.scrollTo({ top: document.querySelector('.shadow-card:last-child')?.getBoundingClientRect().top || 0, behavior: 'smooth' });
            }
          },
          duration: 10000
        }
      );
      if (id) loadData(id);
      setSelectedInstallment(null);
    } catch (error) {
      toast.error("সমস্যা হয়েছে, আবার চেষ্টা করুন।");
    } finally {
      setIsPaying(false);
    }
  };

  const formatInstallmentNo = (no: number) => {
    const banglaNumbers = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    const suffix = no === 1 ? "ম" : no === 2 ? "য়" : "তম";
    return (
      no
        .toString()
        .split("")
        .map((d) => banglaNumbers[parseInt(d)])
        .join("") +
      suffix +
      " কিস্তি"
    );
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  if (isLoading) {
    return <div className="text-center py-8">লোড হচ্ছে...</div>;
  }

  if (!contract || !customer) {
    return <div className="text-center py-8">ডেটা পাওয়া যায়নি</div>;
  }

  const statusBadgeConfig = {
    GREEN: { label: "সম্পূর্ণ পরিশোধ", className: "bg-success text-success-foreground" },
    YELLOW: { label: "কিস্তি চলছে", className: "bg-warning text-warning-foreground" },
    RED: { label: "ডিউ কিস্তি আছে", className: "bg-destructive text-destructive-foreground" },
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate("/dashboard")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        ড্যাশবোর্ডে ফিরে যান
      </Button>

      {/* Customer Info */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={customer.photo_url} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {customer.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{customer.name}</h2>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Summary */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>বিক্রি সারসংক্ষেপ</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground">প্রোডাক্ট:</span>
            <span className="font-semibold">{contract.product_name}</span>
          </div>
          <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground">মোট মূল্য:</span>
            <span className="font-semibold">৳{contract.product_price.toLocaleString("bn-BD")}</span>
          </div>
          <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground">মোট কিস্তি:</span>
            <span>{contract.total_installments} টি</span>
          </div>
          <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground">প্রতি কিস্তি (বেস):</span>
            <span>৳{contract.base_installment_amount.toLocaleString("bn-BD")}</span>
          </div>
          <div className="flex justify-between p-3 bg-success/10 rounded-lg">
            <span className="text-muted-foreground">মোট পরিশোধিত টাকা:</span>
            <span className="font-semibold text-success">
              ৳{contract.total_paid_amount.toLocaleString("bn-BD")}
            </span>
          </div>
          <div className="flex justify-between p-3 bg-destructive/10 rounded-lg">
            <span className="text-muted-foreground">বাকি টাকা:</span>
            <span className="font-semibold text-destructive">
              ৳{contract.remaining_amount.toLocaleString("bn-BD")}
            </span>
          </div>
          <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground">বিক্রির তারিখ:</span>
            <span>{formatDate(contract.sale_date)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Installment Schedule */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>কিস্তি তফসিল</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>কিস্তি নং</TableHead>
                  <TableHead>ডিউ তারিখ</TableHead>
                  <TableHead>পরিমাণ</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>পরিশোধের তারিখ</TableHead>
                  <TableHead>Paid করেছেন</TableHead>
                  <TableHead>একশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {installments.map((installment) => {
                  const statusConfig = {
                    PAID: { label: "পরিশোধ হয়েছে", className: "bg-success/20 text-success" },
                    OVERDUE: { label: "ডিউ হয়ে গেছে", className: "bg-destructive/20 text-destructive" },
                    UPCOMING: { label: "পরিশোধ হয়নি", className: "bg-muted text-muted-foreground" },
                  };
                  const status = statusConfig[installment.status];

                  return (
                    <TableRow key={installment._id}>
                      <TableCell className="font-medium">
                        {formatInstallmentNo(installment.installment_no)}
                      </TableCell>
                      <TableCell>{formatDate(installment.due_date)}</TableCell>
                      <TableCell className="font-semibold">
                        ৳{installment.amount.toLocaleString("bn-BD")}
                      </TableCell>
                      <TableCell>
                        <Badge className={status.className}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {installment.paid_date ? formatDate(installment.paid_date) : "-"}
                      </TableCell>
                      <TableCell>{installment.paid_by_name || "-"}</TableCell>
                      <TableCell>
                        {installment.status !== "PAID" &&
                          new Date(installment.due_date) <= new Date() && (
                            <Button
                              size="sm"
                              onClick={() => setSelectedInstallment(installment)}
                            >
                              Paid মার্ক করুন
                            </Button>
                          )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedInstallment} onOpenChange={() => setSelectedInstallment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>কিস্তি পরিশোধ কনফার্মেশন</DialogTitle>
            <DialogDescription>
              আপনি কি নিশ্চিত যে <strong>{customer.name}</strong>-এর{" "}
              <strong>
                {selectedInstallment && formatInstallmentNo(selectedInstallment.installment_no)}
              </strong>{" "}
              এর টাকা পেয়েছেন?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedInstallment(null)}>
              বাতিল করুন
            </Button>
            <Button onClick={handleMarkPaid} disabled={isPaying}>
              {isPaying ? "সেভ হচ্ছে..." : "নিশ্চিত করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
