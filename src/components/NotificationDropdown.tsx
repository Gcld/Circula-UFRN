import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Package, Loader2 } from 'lucide-react';
import { useTradeNotifications } from '@/hooks/useTradeNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NotificationDropdown = () => {
  const { notifications, unreadCount, loading } = useTradeNotifications();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getNotificationMessage = (trade: any) => {
    if (trade.status === 'pendente') {
      return {
        title: 'Nova proposta de troca',
        description: `${trade.proponente?.nome_completo} quer trocar por ${trade.objeto_desejado?.titulo}`,
        variant: 'default' as const,
      };
    } else if (trade.status === 'aceita') {
      return {
        title: 'Proposta aceita',
        description: `Sua troca foi aceita! Objeto: ${trade.objeto_desejado?.titulo}`,
        variant: 'success' as const,
      };
    }
    return {
      title: 'Notificação',
      description: 'Você tem uma atualização',
      variant: 'default' as const,
    };
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} nova{unreadCount !== 1 ? 's' : ''}</Badge>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhuma notificação
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="divide-y">
              {notifications.map((trade) => {
                const notification = getNotificationMessage(trade);
                return (
                  <Link
                    key={trade.id}
                    to="/trocas"
                    className="block p-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={trade.proponente?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10">
                          {trade.proponente?.nome_completo
                            ? getInitials(trade.proponente.nome_completo)
                            : <Package className="h-5 w-5" />}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-semibold text-sm">
                            {notification.title}
                          </p>
                          {trade.status === 'pendente' && (
                            <Badge variant="default" className="text-xs">
                              Novo
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(trade.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              asChild
            >
              <Link to="/trocas">Ver todas as trocas</Link>
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
