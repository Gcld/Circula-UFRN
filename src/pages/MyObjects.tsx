import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Object as ObjectType, ObjectStatus } from '@/types/database';
import Navbar from '@/components/Navbar';
import ObjectCard from '@/components/ObjectCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Package } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const MyObjects = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const [objects, setObjects] = useState<ObjectType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchMyObjects();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchMyObjects = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('objects')
                .select(`
          *,
            owner:profiles(*)
        `)
                .eq('owner_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setObjects(data || []);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Erro ao buscar meus objetos:', error);
            toast({
                title: 'Erro ao carregar objetos',
                description: 'Não foi possível carregar seus objetos.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const filterObjects = (status?: ObjectStatus) => {
        if (!status) return objects;
        return objects.filter((obj) => obj.status === status);
    };

    const EmptyState = ({ message }: { message: string }) => (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg mb-6">{message}</p>
            <Button onClick={() => navigate('/cadastrar-objeto')}>
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Novo Objeto
            </Button>
        </div>
    );

    const ObjectGrid = ({ items }: { items: ObjectType[] }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((object) => (
                <ObjectCard key={object.id} object={object} />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                            Meus Objetos
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Gerencie seus itens cadastrados e acompanhe o status das trocas
                        </p>
                    </div>
                    <Button onClick={() => navigate('/cadastrar-objeto')} size="lg">
                        <Plus className="mr-2 h-5 w-5" />
                        Novo Objeto
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <Tabs defaultValue="todos" className="w-full">
                        <TabsList className="mb-8 grid w-full max-w-[600px] grid-cols-4">
                            <TabsTrigger value="todos">Todos</TabsTrigger>
                            <TabsTrigger value="disponivel">Disponíveis</TabsTrigger>
                            <TabsTrigger value="em_negociacao">Negociando</TabsTrigger>
                            <TabsTrigger value="trocado">Trocados</TabsTrigger>
                        </TabsList>

                        <TabsContent value="todos" className="mt-0">
                            {objects.length === 0 ? (
                                <EmptyState message="Você ainda não possui nenhum objeto cadastrado." />
                            ) : (
                                <ObjectGrid items={objects} />
                            )}
                        </TabsContent>

                        <TabsContent value="disponivel" className="mt-0">
                            {filterObjects('disponivel').length === 0 ? (
                                <EmptyState message="Nenhum objeto disponível no momento." />
                            ) : (
                                <ObjectGrid items={filterObjects('disponivel')} />
                            )}
                        </TabsContent>

                        <TabsContent value="em_negociacao" className="mt-0">
                            {filterObjects('em_negociacao').length === 0 ? (
                                <EmptyState message="Nenhum objeto em negociação." />
                            ) : (
                                <ObjectGrid items={filterObjects('em_negociacao')} />
                            )}
                        </TabsContent>

                        <TabsContent value="trocado" className="mt-0">
                            {filterObjects('trocado').length === 0 ? (
                                <EmptyState message="Nenhum objeto trocado ainda." />
                            ) : (
                                <ObjectGrid items={filterObjects('trocado')} />
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </main>
        </div>
    );
};

export default MyObjects;