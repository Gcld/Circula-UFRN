import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Object as ObjectType } from '@/types/database';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Package, ArrowRight } from 'lucide-react';

const ProposeTrade = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [desiredObject, setDesiredObject] = useState<ObjectType | null>(null);
  const [userObjects, setUserObjects] = useState<ObjectType[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id && user) {
      fetchData();
    }
  }, [id, user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Buscar objeto desejado
      const { data: objectData, error: objectError } = await supabase
        .from('objects')
        .select('*, owner:profiles(*)')
        .eq('id', id)
        .single();

      if (objectError) throw objectError;
      setDesiredObject(objectData);

      // Buscar objetos do usuário
      const { data: userObjectsData, error: userObjectsError } = await supabase
        .from('objects')
        .select('*')
        .eq('owner_id', user?.id)
        .eq('status', 'disponivel')
        .order('created_at', { ascending: false });

      if (userObjectsError) throw userObjectsError;
      setUserObjects(userObjectsData || []);
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados.',
        variant: 'destructive',
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedObjectId) {
      toast({
        title: 'Erro',
        description: 'Selecione um objeto para oferecer.',
        variant: 'destructive',
      });
      return;
    }

    if (!desiredObject) return;

    try {
      setSubmitting(true);

      const { error } = await supabase.from('trades').insert({
        proponente_id: user?.id!,
        receptor_id: desiredObject.owner_id,
        objeto_oferecido_id: selectedObjectId,
        objeto_desejado_id: desiredObject.id,
        mensagem: message.trim() || null,
        status: 'pendente',
      });

      if (error) throw error;

      toast({
        title: 'Proposta enviada!',
        description: 'Sua proposta de troca foi enviada com sucesso.',
      });

      navigate('/');
    } catch (error: any) {
      console.error('Erro ao enviar proposta:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a proposta. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
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

  if (!desiredObject) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Propor Troca</h1>
          <p className="text-muted-foreground">
            Selecione um de seus objetos para oferecer em troca
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Resumo da Troca */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Objeto que você está oferecendo */}
            <Card className={selectedObjectId ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle className="text-sm">Você oferece</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedObjectId ? (
                  <div className="space-y-2">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      {userObjects.find(obj => obj.id === selectedObjectId)?.imagens?.[0] ? (
                        <img
                          src={userObjects.find(obj => obj.id === selectedObjectId)!.imagens[0]}
                          alt="Seu objeto"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="font-semibold text-sm">
                      {userObjects.find(obj => obj.id === selectedObjectId)?.titulo}
                    </p>
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Package className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm">Selecione um objeto</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <ArrowRight className="h-8 w-8 text-muted-foreground" />
            </div>

            {/* Objeto desejado */}
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-sm">Em troca de</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    {desiredObject.imagens?.[0] ? (
                      <img
                        src={desiredObject.imagens[0]}
                        alt={desiredObject.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="font-semibold text-sm">{desiredObject.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    de {desiredObject.owner?.nome_completo}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seleção de Objeto */}
          <Card>
            <CardHeader>
              <CardTitle>Selecione o objeto que deseja oferecer</CardTitle>
              <CardDescription>
                {userObjects.length === 0
                  ? 'Você não tem objetos disponíveis para troca. Cadastre um objeto primeiro.'
                  : 'Escolha um dos seus objetos disponíveis'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userObjects.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Você precisa ter objetos cadastrados para propor uma troca
                  </p>
                  <Button onClick={() => navigate('/cadastrar-objeto')}>
                    Cadastrar Objeto
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {userObjects.map((obj) => (
                    <button
                      key={obj.id}
                      type="button"
                      onClick={() => setSelectedObjectId(obj.id)}
                      className={`p-3 rounded-lg border-2 transition-all hover:border-primary ${
                        selectedObjectId === obj.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      }`}
                    >
                      <div className="aspect-square rounded-md overflow-hidden bg-muted mb-2">
                        {obj.imagens?.[0] ? (
                          <img
                            src={obj.imagens[0]}
                            alt={obj.titulo}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="font-semibold text-sm truncate">{obj.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        {categoryLabels[obj.categoria]}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mensagem */}
          {userObjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Mensagem (opcional)</CardTitle>
                <CardDescription>
                  Adicione uma mensagem para o dono do objeto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ex: Olá! Tenho interesse no seu objeto e gostaria de propor uma troca..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {message.length}/500 caracteres
                </p>
              </CardContent>
            </Card>
          )}

          {/* Botões */}
          {userObjects.length > 0 && (
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!selectedObjectId || submitting}
                className="flex-1"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Proposta'
                )}
              </Button>
            </div>
          )}
        </form>
      </main>
    </div>
  );
};

export default ProposeTrade;
