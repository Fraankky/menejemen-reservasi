import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        // Check if user exists in admin table
        const { data: adminData } = await supabase
          .from("admin")  // ← GANTI DARI "user_roles" KE "admin"
          .select("role, username")
          .eq("id_admin", session.user.id)  // ← GANTI DARI "user_id" KE "id_admin"
          .single();

        // User is admin if they exist in admin table
        setIsAdmin(adminData?.role === "superadmin" || adminData?.role === "operator");  // ← SESUAIKAN DENGAN ROLE DI DATABASE
      }
      
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);

        if (session) {
          const { data: adminData } = await supabase
            .from("admin")  // ← GANTI DARI "user_roles" KE "admin"
            .select("role, username")
            .eq("id_admin", session.user.id)  // ← GANTI DARI "user_id" KE "id_admin"
            .single();

          setIsAdmin(adminData?.role === "superadmin" || adminData?.role === "operator");  // ← SESUAIKAN DENGAN ROLE
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;