import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Login() {
  const { type } = useParams<{ type: "owner" | "employee" }>();
  const navigate = useNavigate();
  const { loginAsOwner, loginAsEmployee, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [ownerCreds, setOwnerCreds] = useState({ username: "", password: "" });
  const [employeeCreds, setEmployeeCreds] = useState({ username: "", pin: "" });

  const isOwnerLogin = type === "owner";

  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isOwnerLogin) {
        await loginAsOwner(ownerCreds.username, ownerCreds.password);
      } else {
        await loginAsEmployee(employeeCreds.username, employeeCreds.pin);
      }
      navigate("/dashboard");
      toast.success("সফলভাবে লগইন হয়েছে!");
    } catch (error) {
      toast.error("লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 px-4">
      <Card className="w-full max-w-md shadow-card-hover">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold text-primary">LEV কিস্তি</CardTitle>
          <CardDescription className="text-base">
            {isOwnerLogin ? "মালিক লগইন" : "কর্মচারী লগইন"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isOwnerLogin ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">ইউজারনেম</Label>
                  <Input
                    id="username"
                    type="text"
                    value={ownerCreds.username}
                    onChange={(e) =>
                      setOwnerCreds((prev) => ({ ...prev, username: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">পাসওয়ার্ড</Label>
                  <Input
                    id="password"
                    type="password"
                    value={ownerCreds.password}
                    onChange={(e) =>
                      setOwnerCreds((prev) => ({ ...prev, password: e.target.value }))
                    }
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">ইউজারনেম</Label>
                  <Input
                    id="username"
                    type="text"
                    value={employeeCreds.username}
                    onChange={(e) =>
                      setEmployeeCreds((prev) => ({ ...prev, username: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pin">PIN</Label>
                  <Input
                    id="pin"
                    type="password"
                    maxLength={6}
                    value={employeeCreds.pin}
                    onChange={(e) =>
                      setEmployeeCreds((prev) => ({ ...prev, pin: e.target.value }))
                    }
                    required
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "লোড হচ্ছে..." : "লগইন করুন"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to={isOwnerLogin ? "/login/employee" : "/login/owner"}
              className="text-sm text-primary hover:underline"
            >
              {isOwnerLogin ? "কর্মচারী হিসেবে লগইন করুন" : "মালিক হিসেবে লগইন করুন"}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
