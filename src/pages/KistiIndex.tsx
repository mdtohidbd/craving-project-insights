import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCog, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 px-4">
      <div className="w-full max-w-5xl space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-bold text-primary">LEV কিস্তি</h1>
          <p className="text-2xl text-foreground">ম্যানেজমেন্ট সিস্টেম</p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            সহজ এবং কার্যকর কিস্তি ব্যবস্থাপনা - কাস্টমার, বিক্রয় এবং কিস্তি সংগ্রহ ম্যানেজমেন্ট
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-card-hover hover:shadow-card transition-smooth cursor-pointer" onClick={() => navigate("/login/owner")}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <UserCog className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">মালিক লগইন</CardTitle>
              <CardDescription className="text-base">
                সম্পূর্ণ সিস্টেম ম্যানেজমেন্ট এবং নিয়ন্ত্রণ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg" onClick={() => navigate("/login/owner")}>
                মালিক হিসেবে প্রবেশ করুন
              </Button>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• এমপ্লয়ি ম্যানেজমেন্ট</li>
                <li>• দোকান সেটিংস</li>
                <li>• সম্পূর্ণ রিপোর্ট দেখুন</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-card-hover hover:shadow-card transition-smooth cursor-pointer" onClick={() => navigate("/login/employee")}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-2xl">কর্মচারী লগইন</CardTitle>
              <CardDescription className="text-base">
                দৈনন্দিন কাজ এবং কিস্তি সংগ্রহ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg" variant="outline" onClick={() => navigate("/login/employee")}>
                কর্মচারী হিসেবে প্রবেশ করুন
              </Button>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• কাস্টমার ম্যানেজমেন্ট</li>
                <li>• কিস্তি সংগ্রহ</li>
                <li>• বিক্রয় ম্যানেজমেন্ট</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
