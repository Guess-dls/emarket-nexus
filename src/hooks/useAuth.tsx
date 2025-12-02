import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

type UserRole = "client" | "vendeur" | "admin";

interface UserRoleData {
  role: UserRole;
  statut: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRoleData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          if (!session.user.email_confirmed_at) {
            setUserRole(null);
            setLoading(false);
            // Déconnexion différée pour éviter les deadlocks dans le callback
            setTimeout(() => {
              supabase.auth.signOut();
            }, 0);
            return;
          }
          // Fetch user role after auth state changes
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        if (!session.user.email_confirmed_at) {
          setUserRole(null);
          setLoading(false);
          supabase.auth.signOut();
          return;
        }
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role, statut")
        .eq("user_id", userId);

      if (error) throw error;

      if (!data || data.length === 0) {
        setUserRole(null);
      } else {
        // Prioriser admin > vendeur > client, en privilégiant les rôles actifs
        const roles = data as UserRoleData[];
        const activeRoles = roles.filter((r) => r.statut === "actif");
        const candidates = activeRoles.length > 0 ? activeRoles : roles;
        const priority: UserRole[] = ["admin", "vendeur", "client"];
        const selected =
          priority
            .map((role) => candidates.find((r) => r.role === role))
            .find((r): r is UserRoleData => !!r) || candidates[0];
        setUserRole(selected);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, nom: string, role: UserRole) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nom,
            role,
          },
        },
      });
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error };
      }
      
      // Vérifier si l'email est confirmé
      if (data.user && !data.user.email_confirmed_at) {
        // Déconnecter l'utilisateur
        await supabase.auth.signOut();
        return { 
          error: { 
            message: "Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte de réception.",
            name: "EmailNotConfirmed"
          } as any 
        };
      }
      
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Nettoyer l'état local d'abord
      setUser(null);
      setSession(null);
      setUserRole(null);
      
      // Ensuite déconnecter de Supabase (ignorer les erreurs de session)
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      // Ignorer les erreurs de session déjà invalide
      console.log("Déconnexion avec erreur ignorée:", error);
    } finally {
      // Toujours rediriger vers la page d'accueil
      navigate("/");
    }
  };

  return {
    user,
    session,
    userRole,
    loading,
    signUp,
    signIn,
    signOut,
  };
};
