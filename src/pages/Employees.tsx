import { useEffect, useState } from "react";
import { getEmployees } from "@/api/employees";
import { Employee } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Plus, Phone, Edit } from "lucide-react";
import { toast } from "sonner";

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      toast.error("এমপ্লয়ি তালিকা লোড করতে সমস্যা হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">লোড হচ্ছে...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">এমপ্লয়ি ম্যানেজমেন্ট</h1>
        <Button onClick={() => navigate("/employees/new")}>
          <Plus className="mr-2 h-4 w-4" />
          নতুন এমপ্লয়ি
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {employees.map((employee) => (
          <Card key={employee._id} className="shadow-card hover:shadow-card-hover transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={employee.photo_url} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {employee.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground">{employee.roleLabel}</p>
                    </div>
                    <Badge
                      className={
                        employee.status === "ACTIVE"
                          ? "bg-success/20 text-success"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {employee.status === "ACTIVE" ? "সক্রিয়" : "নিষ্ক্রিয়"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <Phone className="h-3 w-3" />
                    <span>{employee.phone}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    ইউজারনেম: {employee.username}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => navigate(`/employees/${employee._id}/edit`)}
                  >
                    <Edit className="mr-2 h-3 w-3" />
                    এডিট করুন
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
