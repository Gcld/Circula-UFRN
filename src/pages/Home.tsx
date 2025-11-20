import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Object as ObjectType } from '@/types/database';
import Navbar from '@/components/Navbar';
import ObjectCard from '@/components/ObjectCard';
import SearchFilters from '@/components/SearchFilters';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Home = () => {
  const [objects, setObjects] = useState<ObjectType[]>([]);
  const [filteredObjects, setFilteredObjects] = useState<ObjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchObjects();
  }, []);

  const fetchObjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('objects')
        .select(`
          *,
          owner:profiles(*)
        `)
        .eq('status', 'disponivel')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setObjects(data || []);
      setFilteredObjects(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar objetos:', error);
      toast({
        title: 'Erro ao carregar objetos',
        description: 'Ocorreu um erro ao buscar os objetos disponíveis.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-8">
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Encontre objetos para trocar
          </h1>
          <p className="text-muted-foreground text-lg">
            Descubra itens interessantes e faça trocas com outros estudantes da UFRN
          </p>
        </div>

        <SearchFilters objects={objects} onFilter={setFilteredObjects} />

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredObjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Nenhum objeto encontrado com os filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredObjects.map((object) => (
              <ObjectCard key={object.id} object={object} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
