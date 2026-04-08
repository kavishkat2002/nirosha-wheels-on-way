import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useAdminCheck() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    checkAdminRole();
  }, [user, authLoading]);

  const checkAdminRole = async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      console.log("Supabase: Checking admin status for", user.email);
      const { data, error } = await supabase.rpc('is_admin' as any);

      if (error) {
        console.error("Supabase: RPC error checking admin role:", error);
        const fallback = user.email === 'kavishkathilakarathna0@gmail.com' || user.email === 'tkavishka101@gmail.com';
        console.log("Supabase: Using local email fallback:", fallback);
        setIsAdmin(fallback);
      } else {
        const result = data === true || user.email === 'kavishkathilakarathna0@gmail.com' || user.email === 'tkavishka101@gmail.com';
        console.log("Supabase: Admin check result (RPC + Fallback):", result);
        setIsAdmin(result);
      }
    } catch (error) {
      console.error("Supabase: Unexpected error in admin check:", error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, loading: loading || authLoading };
}
