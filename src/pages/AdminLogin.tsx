import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, LogIn } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Query admin by username
      const { data: admin, error } = await supabase
        .from("admin")
        .select("*")
        .eq("username", username)
        .single();

      if (error || !admin) {
        toast({
          title: "Login Gagal",
          description: "Username atau password salah",
          variant: "destructive",
        });
        return;
      }

      // For demo purposes, we're doing a simple comparison
      // In production, use proper password hashing (bcrypt)
      // For now, we'll just check if password matches
      if (password === "admin123") {
        // Store admin session in localStorage
        localStorage.setItem("admin_session", JSON.stringify({
          id: admin.id_admin,
          username: admin.username,
          role: admin.role,
        }));

        toast({
          title: "Login Berhasil",
          description: `Selamat datang, ${admin.nama}`,
        });

        navigate("/admin/dashboard");
      } else {
        toast({
          title: "Login Gagal",
          description: "Username atau password salah",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat login",
        variant: "destructive",
      });

      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-md">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <Card className="p-8">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold">Admin Login</h1>
            <p className="mt-2 text-muted-foreground">
              Akses Dashboard Admin
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              <LogIn className="mr-2 h-4 w-4" />
              {isLoading ? "Memproses..." : "Login"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Demo: username = admin, password = admin123</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
