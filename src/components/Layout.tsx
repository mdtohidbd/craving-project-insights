import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  LayoutDashboard,
  Users,
  FileText,
  UserCog,
  BarChart3,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { getShopSettings } from "@/api/settings";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [shopName, setShopName] = useState<string>("দোকানের নাম");
  const [shopAddress, setShopAddress] = useState<string>("");

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const loadShopSettings = async () => {
      try {
        const settings = await getShopSettings();
        if (settings.name) {
          setShopName(settings.name);
        }
        if (settings.address) {
          setShopAddress(settings.address);
        }
      } catch (error) {
        console.error("Failed to load shop settings:", error);
      }
    };

    if (user) {
      loadShopSettings();
    }

    // Listen for shop settings updates
    const handleShopSettingsUpdate = () => {
      loadShopSettings();
    };

    window.addEventListener('shopSettingsUpdated', handleShopSettingsUpdate);

    return () => {
      window.removeEventListener('shopSettingsUpdated', handleShopSettingsUpdate);
    };
  }, [user]);

  const navItems = [
    { path: "/dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
    { path: "/customers", label: "কাস্টমার", icon: Users },
    { path: "/reports/collections", label: "রিপোর্ট", icon: BarChart3 },
  ];

  if (user?.role === "OWNER") {
    navItems.push(
      { path: "/employees", label: "এমপ্লয়ি", icon: UserCog },
      { path: "/settings/profile", label: "প্রোফাইল সেটিংস", icon: User },
      { path: "/settings/shop", label: "দোকান সেটিংস", icon: Settings }
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`w-64 border-r border-border bg-card transition-transform duration-300 ease-in-out ${
          isSidebarVisible ? "translate-x-0" : "-translate-x-full"
        } fixed left-0 top-0 h-screen z-40`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-border p-6">
            <h1 className="text-xl font-bold text-primary">LEV কিস্তি</h1>
            <p className="text-sm text-muted-foreground">ম্যানেজমেন্ট সিস্টেম</p>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "secondary" : "ghost"}
                    className={`w-full justify-start ${
                      isActive(item.path)
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground"
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border p-4">
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="mr-3 h-5 w-5" />
              লগ আউট
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarVisible && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarVisible(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full">
        {/* Top Bar */}
        <header className="border-b border-border bg-card">
          <div className="flex items-center justify-between px-8 py-4">
            <div
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.photo_url} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.role === "OWNER" ? "মালিক" : user?.roleLabel || "কর্মচারী"}
                  {user?.role === "EMPLOYEE" && user?.roleLabel && ` • ${user.roleLabel}`}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-medium">{shopName}</p>
              <p className="text-xs text-muted-foreground">
                {shopAddress}
               
              </p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
