import { useState, useEffect } from 'react';
import { Object as ObjectType, ObjectCategory } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface SearchFiltersProps {
  objects: ObjectType[];
  onFilter: (filtered: ObjectType[]) => void;
}

const SearchFilters = ({ objects, onFilter }: SearchFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const categoryLabels: Record<ObjectCategory | 'todos', string> = {
    todos: 'Todas as categorias',
    livros: 'Livros',
    eletronicos: 'Eletrônicos',
    roupas: 'Roupas',
    acessorios: 'Acessórios',
    moveis: 'Móveis',
    outros: 'Outros',
  };

  useEffect(() => {
    let filtered = [...objects];

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (obj) =>
          obj.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          obj.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoria
    if (selectedCategory !== 'todos') {
      filtered = filtered.filter((obj) => obj.categoria === selectedCategory);
    }

    onFilter(filtered);
  }, [searchTerm, selectedCategory, objects, onFilter]);

  return (
    <div className="mb-8 space-y-4 p-6 rounded-lg bg-card border border-border">
      <div className="space-y-2">
        <Label htmlFor="search">Buscar objetos</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Digite o nome ou descrição do objeto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SearchFilters;
