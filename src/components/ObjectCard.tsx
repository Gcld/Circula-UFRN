import { Link } from 'react-router-dom';
import { Object as ObjectType } from '@/types/database';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Package } from 'lucide-react';

interface ObjectCardProps {
  object: ObjectType;
}

const ObjectCard = ({ object }: ObjectCardProps) => {
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

  return (
    <Link to={`/objeto/${object.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
        <div className="aspect-square relative overflow-hidden bg-muted">
          {object.imagens && object.imagens.length > 0 ? (
            <img
              src={object.imagens[0]}
              alt={object.titulo}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          <Badge className="absolute top-2 right-2" variant="secondary">
            {categoryLabels[object.categoria]}
          </Badge>
        </div>

        <CardContent className="pt-4 pb-2">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {object.titulo}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {object.descricao}
          </p>
        </CardContent>

        <CardFooter className="pt-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={object.owner?.avatar_url || undefined} />
              <AvatarFallback className="text-xs bg-primary/10">
                {object.owner?.nome_completo ? getInitials(object.owner.nome_completo) : 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground truncate">
              {object.owner?.nome_completo || 'Usuário'}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ObjectCard;
