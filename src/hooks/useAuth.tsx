import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nome_completo: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Buscar perfil do usuário
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: 'Bem-vindo!',
        description: 'Login realizado com sucesso.',
      });
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      toast({
        title: 'Erro no login',
        description: error.message || 'Verifique suas credenciais e tente novamente.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, nome_completo: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nome_completo,
          },
        },
      });

      if (error) throw error;

      toast({
        title: 'Conta criada!',
        description: 'Sua conta foi criada com sucesso. Você já pode fazer login.',
      });
    } catch (error: any) {
      console.error('Erro ao criar conta:', error);
      let errorMessage = 'Ocorreu um erro ao criar sua conta.';
      
      if (error.message.includes('already registered')) {
        errorMessage = 'Este email já está cadastrado. Faça login ou use outro email.';
      } else if (error.message.includes('Password')) {
        errorMessage = 'A senha deve ter no mínimo 6 caracteres.';
      }
      
      toast({
        title: 'Erro no cadastro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: 'Até logo!',
        description: 'Você saiu da sua conta.',
      });
    } catch (error: any) {
      console.error('Erro ao sair:', error);
      toast({
        title: 'Erro ao sair',
        description: 'Ocorreu um erro ao sair da conta.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
