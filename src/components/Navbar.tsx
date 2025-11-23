import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Package, MessageSquare, PlusCircle, User, LogOut, Home } from 'lucide-react';
import ChatModal from './ChatModal';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
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
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
            Circula UFRN
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <Home className="h-5 w-5" />
              <span className="sr-only">Início</span>
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <Link to="/meus-objetos">
              <Package className="h-5 w-5" />
              <span className="sr-only">Meus Objetos</span>
            </Link>
          </Button>

          <Button variant="ghost" size="icon" onClick={() => setChatOpen(true)}>
            <MessageSquare className="h-5 w-5" />
            <span className="sr-only">Chat</span>
          </Button>

          <NotificationDropdown />

          <Button variant="default" size="sm" asChild>
            <Link to="/cadastrar-objeto">
              <PlusCircle className="h-4 w-4 mr-2" />
              Anunciar
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.nome_completo} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {profile?.nome_completo ? getInitials(profile.nome_completo) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profile?.nome_completo}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/perfil" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Meu Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <ChatModal open={chatOpen} onOpenChange={setChatOpen} />
    </nav>
  );
};

export default Navbar;
