import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardSummary } from "@/api/dashboard";
import { getDueTodayInstallments } from "@/api/installments";
import { getContracts } from "@/api/contracts";
import { ApiError } from "@/api/client";
import { DashboardSummary, InstallmentWithDetails, ContractWithCustomer } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DueInstallmentCard } from "@/components/DueInstallmentCard";
import { ContractCard } from "@/components/ContractCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, TrendingUp, AlertCircle, Plus, ArrowRight, Search, X } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [dueInstallments, setDueInstallments] = useState<InstallmentWithDetails[]>([]);
  const [contracts, setContracts] = useState<ContractWithCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = () => {
    loadContracts(search);
  };

  const handleReset = () => {
    setSearch("");
    loadContracts("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const loadData = async () => {
    try {
      const [summaryData, dueData, contractsData] = await Promise.all([
        getDashboardSummary(),
        getDueTodayInstallments(),
        getContracts(),
      ]);
      setSummary(summaryData);
      setDueInstallments(dueData);
      setContracts(contractsData);
    } catch (error) {
      // Don't show error toast for 401 - auto-logout will handle it
      if (error instanceof ApiError && error.status !== 401) {
        toast.error("ডেটা লোড করতে সমস্যা হয়েছে");
      } else if (!(error instanceof ApiError)) {
        toast.error("ডেটা লোড করতে সমস্যা হয়েছে");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadContracts = async (searchTerm: string) => {
    setIsSearching(true);
    try {
      const data = await getContracts(searchTerm.trim() ? { search: searchTerm.trim() } : undefined);
      setContracts(data);
    } catch (error) {
      // Don't show error toast for 401 - auto-logout will handle it
      if (error instanceof ApiError && error.status !== 401) {
        toast.error("কিস্তি তালিকা লোড করতে সমস্যা হয়েছে");
      } else if (!(error instanceof ApiError)) {
        toast.error("কিস্তি তালিকা লোড করতে সমস্যা হয়েছে");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleInstallmentPaid = (installmentId: string) => {
    setDueInstallments((prev) => prev.filter((item) => item.installment._id !== installmentId));
    loadData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">লোড হচ্ছে...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-card hover:shadow-card-hover transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              মোট কাস্টমার
            </CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary?.total_customers || 0}</div>
            <Button 
              onClick={() => navigate("/customers")}
              variant="outline"
              className="mt-3 w-full"
              size="sm"
            >
              সকল কাস্টমার দেখুন
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-card-hover transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              মোট বিক্রি
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ৳{summary?.total_sales_amount.toLocaleString("bn-BD") || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-card-hover transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              মোট বাকি
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ৳{summary?.total_outstanding_amount.toLocaleString("bn-BD") || 0}
            </div>
            <Button 
              onClick={() => navigate("/reports/collections")}
              variant="outline"
              className="mt-3 w-full"
              size="sm"
            >
              সংগ্রহ রিপোর্ট দেখুন
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex gap-4">
        <Button 
          onClick={() => navigate("/customers/new")}
          size="lg"
          className="flex-1"
        >
          <Plus className="mr-2 h-5 w-5" />
          নতুন কাস্টমার
        </Button>
        <Button 
          onClick={() => navigate("/contracts/new")}
          size="lg"
          className="flex-1"
        >
          <Plus className="mr-2 h-5 w-5" />
          নতুন কিস্তি
        </Button>
      </div>

      {/* Today's Due Installments */}
      {dueInstallments.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">আজকের কিস্তি সংগ্রহ</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {dueInstallments.map((item) => (
              <DueInstallmentCard
                key={item.installment._id}
                data={item}
                onPaid={handleInstallmentPaid}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Contracts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">সকল বিক্রি (কিস্তি)</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder="নাম বা মোবাইল দিয়ে খুঁজুন"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleKeyPress}
                className="max-w-xs"
              />
              <Button 
                onClick={handleSearch}
                size="sm"
                variant="outline"
              >
                <Search className="h-4 w-4" />
              </Button>
              {search && (
                <Button 
                  onClick={handleReset}
                  size="sm"
                  variant="outline"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {isSearching ? (
            // Skeleton loaders while searching
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="shadow-card relative">
                <Skeleton className="absolute top-4 right-4 h-6 w-24 rounded-full" />
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1 space-y-3">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                      <div className="space-y-2 border-t border-border pt-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            contracts.filter(item => item?.contract?._id).map((item) => (
              <ContractCard key={item.contract._id} data={item} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
