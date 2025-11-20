import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Object as ObjectType } from '@/types/database';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Package, 
  ArrowLeft, 
  MessageSquare, 
  MapPin,
  Calendar,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ObjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [object, setObject] = useState<ObjectType | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchObject();
    }
  }, [id]);

  const fetchObject = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('objects')
        .select(`
          *,
          owner:profiles(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setObject(data);
    } catch (error: any) {
      console.error('Erro ao buscar objeto:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes do objeto.',
        variant: 'destructive',
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const categoryLabels: Record<string, string> = {
    livros: 'Livros',
    eletronicos: 'Eletrônicos',
    roupas: 'Roupas',
    acessorios: 'Acessórios',
    moveis: 'Móveis',
    outros: 'Outros',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!object) {
    return null;
  }

  const isOwner = user?.id === object.owner_id;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galeria de Imagens */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {object.imagens && object.imagens.length > 0 ? (
                <img
                  src={object.imagens[currentImageIndex]}
                  alt={object.titulo}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>
            
            {object.imagens && object.imagens.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {object.imagens.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                      currentImageIndex === index
                        ? 'border-primary'
                        : 'border-transparent hover:border-primary/50'
                    }`}
                  >
                    <img src={img} alt={`${object.titulo} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detalhes do Objeto */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold">{object.titulo}</h1>
                <Badge variant="secondary">{categoryLabels[object.categoria]}</Badge>
              </div>
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Publicado {formatDistanceToNow(new Date(object.created_at), { addSuffix: true, locale: ptBR })}
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="font-semibold text-lg mb-2">Descrição</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{object.descricao}</p>
            </div>

            <div>
              <h2 className="font-semibold text-lg mb-2">Condição</h2>
              <Badge variant="outline">{object.condicao}</Badge>
            </div>

            <Separator />

            {/* Informações do Dono */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Anunciante</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  to={`/perfil/${object.owner_id}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={object.owner?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10">
                      {object.owner?.nome_completo ? getInitials(object.owner.nome_completo) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{object.owner?.nome_completo}</p>
                    {object.owner?.curso && (
                      <p className="text-sm text-muted-foreground">{object.owner.curso}</p>
                    )}
                  </div>
                </Link>
              </CardContent>
            </Card>

            {/* Ações */}
            {!isOwner && object.status === 'disponivel' && (
              <Button
                size="lg"
                className="w-full"
                onClick={() => navigate(`/propor-troca/${object.id}`)}
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Propor Troca
              </Button>
            )}

            {isOwner && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => navigate(`/editar-objeto/${object.id}`)}
                >
                  Editar Objeto
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ObjectDetail;
