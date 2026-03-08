import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getCollectionsReport } from "@/api/reports";
import { getDashboardSummary } from "@/api/dashboard";
import { getDueTodayInstallments, getAllOverdueInstallments } from "@/api/installments";
import { CollectionReport, DashboardSummary, InstallmentWithDetails } from "@/types";
import { ApiError } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, AlertCircle, TrendingDown, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function CollectionsReport() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });
  const [report, setReport] = useState<CollectionReport | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [todayInstallments, setTodayInstallments] = useState<InstallmentWithDetails[]>([]);
  const [allOverdueInstallments, setAllOverdueInstallments] = useState<InstallmentWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOutstanding, setIsLoadingOutstanding] = useState(true);

  const loadOutstandingData = async () => {
    setIsLoadingOutstanding(true);
    try {
      const [summaryData, todayData, overdueData] = await Promise.all([
        getDashboardSummary(),
        getDueTodayInstallments(),
        getAllOverdueInstallments(),
      ]);
      setSummary(summaryData);
      setTodayInstallments(todayData);
      setAllOverdueInstallments(overdueData);
    } catch (error) {
      if (error instanceof ApiError && error.status !== 401) {
        toast.error("ডেটা লোড করতে সমস্যা হয়েছে");
      }
    } finally {
      setIsLoadingOutstanding(false);
    }
  };

  const handleLoadReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCollectionsReport(dateRange);
      setReport(data);
    } catch (error) {
      if (error instanceof ApiError && error.status !== 401) {
        toast.error("রিপোর্ট লোড করতে সমস্যা হয়েছে");
      }
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadOutstandingData();
    handleLoadReport();
  }, [handleLoadReport]);

  const handleExport = () => {
    if (!report) return;

    const csvContent = [
      ["কাস্টমার", "মোবাইল", "প্রোডাক্ট", "কিস্তি নং", "পরিমাণ", "পরিশোধের তারিখ", "Paid করেছেন"],
      ...report.items.map((item) => [
        item.customer_name,
        item.phone,
        item.product_name,
        item.installment_no,
        item.amount,
        new Date(item.paid_date).toLocaleDateString("bn-BD"),
        item.paid_by_name,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `collections_report_${dateRange.from}_to_${dateRange.to}.csv`;
    link.click();

    toast.success("রিপোর্ট এক্সপোর্ট হয়েছে!");
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Calculate total remaining installments - count all overdue installments
  const totalRemainingInstallments = allOverdueInstallments.length;

  // Calculate today's due amount and count from today's installments only
  const todayDueAmount = todayInstallments.reduce(
    (sum, item) => sum + item.installment.amount,
    0
  );
  const todayDueCount = todayInstallments.length;

  // Group all overdue installments by customer
  const customersWithDue = allOverdueInstallments.reduce((acc, item) => {
    const customerId = item.customer._id;
    if (!acc[customerId]) {
      acc[customerId] = {
        customer: item.customer,
        installments: [],
        totalDue: 0,
        nextDueDate: null,
      };
    }
    acc[customerId].installments.push(item.installment);
    acc[customerId].totalDue += item.installment.amount;
    const dueDate = new Date(item.installment.due_date);
    if (!acc[customerId].nextDueDate || dueDate < acc[customerId].nextDueDate) {
      acc[customerId].nextDueDate = dueDate;
    }
    return acc;
  }, {} as Record<string, {
    customer: InstallmentWithDetails['customer'];
    installments: InstallmentWithDetails['installment'][];
    totalDue: number;
    nextDueDate: Date | null;
  }>);

  const customersWithDueList = Object.values(customersWithDue);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">সংগ্রহ রিপোর্ট</h1>

      {/* Outstanding Information Section */}
      {!isLoadingOutstanding && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                মোট বাকি
              </CardTitle>
              <TrendingDown className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ৳{summary?.total_outstanding_amount.toLocaleString("bn-BD") || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                বাকি কিস্তি সংখ্যা
              </CardTitle>
              <AlertCircle className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalRemainingInstallments} টি</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                আজকের বাকি
              </CardTitle>
              <Calendar className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                ৳{todayDueAmount.toLocaleString("bn-BD")}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {todayDueCount} টি কিস্তি
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Today's Due Installments List */}
      {!isLoadingOutstanding && todayInstallments.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>আজকের কিস্তি সংগ্রহ</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {todayInstallments.length} টি কিস্তি
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>কাস্টমার</TableHead>
                    <TableHead>মোবাইল</TableHead>
                    <TableHead>প্রোডাক্ট</TableHead>
                    <TableHead>কিস্তি নং</TableHead>
                    <TableHead>পরিমাণ</TableHead>
                    <TableHead>তারিখ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayInstallments.map((item) => (
                    <TableRow key={item.installment._id}>
                      <TableCell 
                        className="font-medium cursor-pointer hover:text-primary"
                        onClick={() => navigate(`/customers/${item.customer._id}`)}
                      >
                        {item.customer.name}
                      </TableCell>
                      <TableCell>{item.customer.phone}</TableCell>
                      <TableCell>{item.contract.product_name}</TableCell>
                      <TableCell>{item.installment.installment_no}</TableCell>
                      <TableCell className="font-semibold text-destructive">
                        ৳{item.installment.amount.toLocaleString("bn-BD")}
                      </TableCell>
                      <TableCell>
                        {formatDate(item.installment.due_date)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customers with Due Installments */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>কাস্টমারদের বাকি কিস্তি</CardTitle>
          {!isLoadingOutstanding && (
            <p className="text-sm text-muted-foreground mt-1">
              {customersWithDueList.length > 0 
                ? `${customersWithDueList.length} জন কাস্টমারের ${totalRemainingInstallments} টি বাকি কিস্তি`
                : "কোন বাকি কিস্তি নেই"}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {isLoadingOutstanding ? (
            <div className="text-center py-8 text-muted-foreground">
              লোড হচ্ছে...
            </div>
          ) : customersWithDueList.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>কাস্টমার</TableHead>
                    <TableHead>মোবাইল</TableHead>
                    <TableHead>বাকি কিস্তি</TableHead>
                    <TableHead>মোট বাকি</TableHead>
                    <TableHead>পরবর্তী তারিখ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customersWithDueList.map((item) => (
                    <TableRow key={item.customer._id}>
                      <TableCell 
                        className="font-medium cursor-pointer hover:text-primary"
                        onClick={() => navigate(`/customers/${item.customer._id}`)}
                      >
                        {item.customer.name}
                      </TableCell>
                      <TableCell>{item.customer.phone}</TableCell>
                      <TableCell className="font-semibold text-warning">
                        {item.installments.length} টি
                      </TableCell>
                      <TableCell className="font-semibold text-warning">
                        ৳{item.totalDue.toLocaleString("bn-BD")}
                      </TableCell>
                      <TableCell>
                        {item.nextDueDate ? formatDate(item.nextDueDate.toISOString()) : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              কোন বাকি কিস্তি নেই
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>তারিখ নির্বাচন করুন</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="from">তারিখ থেকে</Label>
              <Input
                id="from"
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">তারিখ পর্যন্ত</Label>
              <Input
                id="to"
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleLoadReport} disabled={isLoading} className="w-full">
                {isLoading ? "লোড হচ্ছে..." : "রিপোর্ট দেখুন"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {report && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  মোট সংগ্রহ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">
                  ৳{report.total_collected.toLocaleString("bn-BD")}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  পরিশোধিত কিস্তি
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{report.count} টি</div>
                {report.customer_count && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {report.customer_count} জন কাস্টমার থেকে
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  কাস্টমার সংখ্যা
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {report.customer_count || 0} জন
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>বিস্তারিত তালিকা</CardTitle>
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Excel এ এক্সপোর্ট করুন
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>কাস্টমার</TableHead>
                      <TableHead>মোবাইল</TableHead>
                      <TableHead>প্রোডাক্ট</TableHead>
                      <TableHead>কিস্তি নং</TableHead>
                      <TableHead>পরিমাণ</TableHead>
                      <TableHead>পরিশোধের তারিখ</TableHead>
                      <TableHead>Paid করেছেন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.items.map((item, idx) => (
                      <TableRow key={item.installment_id || idx}>
                        <TableCell>{item.customer_name}</TableCell>
                        <TableCell>{item.phone}</TableCell>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>{item.installment_no}</TableCell>
                        <TableCell className="font-semibold">
                          ৳{item.amount.toLocaleString("bn-BD")}
                        </TableCell>
                        <TableCell>{formatDate(item.paid_date)}</TableCell>
                        <TableCell>{item.paid_by_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
