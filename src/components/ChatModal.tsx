import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Send, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Trade, Message, Profile } from '@/types/database';

interface ChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TradeWithProfiles extends Trade {
  proponente: Profile;
  receptor: Profile;
}

const ChatModal = ({ open, onOpenChange }: ChatModalProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [trades, setTrades] = useState<TradeWithProfiles[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<TradeWithProfiles | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && profile) {
      loadTrades();
    }
  }, [open, profile]);

  useEffect(() => {
    if (selectedTrade) {
      loadMessages(selectedTrade.id);
      subscribeToMessages(selectedTrade.id);
    }
  }, [selectedTrade]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadTrades = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('trades')
      .select(`
        *,
        proponente:profiles!trades_proponente_id_fkey(*),
        receptor:profiles!trades_receptor_id_fkey(*)
      `)
      .or(`proponente_id.eq.${profile.id},receptor_id.eq.${profile.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Erro ao carregar conversas',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setTrades(data as TradeWithProfiles[]);
  };

  const loadMessages = async (tradeId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('trade_id', tradeId)
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: 'Erro ao carregar mensagens',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setMessages(data);
  };

  const subscribeToMessages = (tradeId: string) => {
    const channel = supabase
      .channel(`messages:${tradeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `trade_id=eq.${tradeId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTrade || !profile) return;

    setLoading(true);
    const { error } = await supabase.from('messages').insert({
      trade_id: selectedTrade.id,
      sender_id: profile.id,
      content: newMessage.trim(),
    });

    if (error) {
      toast({
        title: 'Erro ao enviar mensagem',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setNewMessage('');
    }
    setLoading(false);
  };

  const getOtherUser = (trade: TradeWithProfiles) => {
    return trade.proponente_id === profile?.id ? trade.receptor : trade.proponente;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] p-0">
        <div className="flex h-full">
          {/* Lista de conversas */}
          <div className={`${selectedTrade ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r border-border`}>
            <DialogHeader className="p-4 border-b border-border">
              <DialogTitle>Conversas</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[calc(600px-73px)]">
              {trades.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Nenhuma conversa ainda
                </div>
              ) : (
                trades.map((trade) => {
                  const otherUser = getOtherUser(trade);
                  return (
                    <button
                      key={trade.id}
                      onClick={() => setSelectedTrade(trade)}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-accent transition-colors ${
                        selectedTrade?.id === trade.id ? 'bg-accent' : ''
                      }`}
                    >
                      <Avatar>
                        <AvatarImage src={otherUser.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(otherUser.nome_completo)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm">{otherUser.nome_completo}</p>
                        <p className="text-xs text-muted-foreground">
                          {trade.status === 'pendente' ? 'Pendente' : 
                           trade.status === 'aceita' ? 'Aceita' : 
                           trade.status === 'recusada' ? 'Recusada' :
                           trade.status === 'concluida' ? 'Concluída' : 'Cancelada'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </ScrollArea>
          </div>

          {/* Área de mensagens */}
          <div className={`${selectedTrade ? 'block' : 'hidden md:block'} flex-1 flex flex-col`}>
            {selectedTrade ? (
              <>
                <DialogHeader className="p-4 border-b border-border flex flex-row items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSelectedTrade(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Avatar>
                    <AvatarImage src={getOtherUser(selectedTrade).avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(getOtherUser(selectedTrade).nome_completo)}
                    </AvatarFallback>
                  </Avatar>
                  <DialogTitle>{getOtherUser(selectedTrade).nome_completo}</DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 flex ${
                        message.sender_id === profile?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender_id === profile?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.created_at!).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </ScrollArea>

                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      disabled={loading}
                    />
                    <Button onClick={sendMessage} disabled={loading || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
                Selecione uma conversa
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;
