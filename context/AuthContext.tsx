// context/AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Public routes that don't require redirect
    const publicRoutes = ['/login', '/register', '/auth/login', '/auth/register', '/forgot-password'];
    const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));
    const isHomePage = pathname === '/';

    // Fetch the current user on mount
    const getUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error fetching session:", error);
          setUser(null);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          
          // Redirect to dashboard if user is on public routes or home page
          if (isPublicRoute || isHomePage) {
            router.replace('/dashboard');
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error in getUser:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          // Redirect to dashboard on sign in
          if (isPublicRoute || isHomePage) {
            router.replace('/dashboard');
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          router.replace('/');
        } else if (event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null);
        } else {
          setUser(session?.user ?? null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase, router, pathname]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};