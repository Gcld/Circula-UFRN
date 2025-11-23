import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Trade } from '@/types/database';

export interface TradeNotification {
  id: string;
  proponente_id: string;
  receptor_id: string;
  objeto_oferecido_id: string;
  objeto_desejado_id: string;
  location_id?: string;
  status: 'pendente' | 'aceita' | 'recusada' | 'concluida' | 'cancelada';
  mensagem?: string;
  created_at: string;
  updated_at: string;
  proponente?: {
    nome_completo: string;
    avatar_url?: string;
  };
  objeto_oferecido?: {
    titulo: string;
  };
  objeto_desejado?: {
    titulo: string;
  };
}

export const useTradeNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<TradeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    loadNotifications();
    subscribeToTrades();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Buscar trocas recebidas (onde o usuário é o receptor)
      const { data, error } = await supabase
        .from('trades')
        .select(`
          *,
          proponente:profiles!trades_proponente_id_fkey(nome_completo, avatar_url),
          objeto_oferecido:objects!trades_objeto_oferecido_id_fkey(titulo),
          objeto_desejado:objects!trades_objeto_desejado_id_fkey(titulo)
        `)
        .eq('receptor_id', user.id)
        .in('status', ['pendente', 'aceita'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setNotifications(data || []);
      
      // Contar notificações não lidas (pendentes)
      const unread = data?.filter(trade => trade.status === 'pendente').length || 0;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToTrades = () => {
    if (!user) return;

    const channel = supabase
      .channel('trade-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trades',
          filter: `receptor_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Trade change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Nova proposta recebida
            loadNotifications();
          } else if (payload.eventType === 'UPDATE') {
            // Status da troca atualizado
            loadNotifications();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (tradeId: string) => {
    // Esta função pode ser expandida para marcar notificações como lidas
    // Por enquanto, vamos apenas recarregar
    await loadNotifications();
  };

  const clearAll = async () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    clearAll,
    refresh: loadNotifications,
  };
};
