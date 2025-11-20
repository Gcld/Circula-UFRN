export type ObjectCategory = 'livros' | 'eletronicos' | 'roupas' | 'acessorios' | 'moveis' | 'outros';
export type ObjectStatus = 'disponivel' | 'em_negociacao' | 'trocado';
export type TradeStatus = 'pendente' | 'aceita' | 'recusada' | 'concluida' | 'cancelada';
export type AppRole = 'admin' | 'user';

export interface Profile {
  id: string;
  email: string;
  nome_completo: string;
  matricula?: string;
  curso?: string;
  avatar_url?: string;
  bio?: string;
  telefone?: string;
  vinculo_ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface Object {
  id: string;
  owner_id: string;
  titulo: string;
  descricao: string;
  categoria: ObjectCategory;
  condicao: string;
  imagens: string[];
  status: ObjectStatus;
  created_at: string;
  updated_at: string;
  owner?: Profile;
}

export interface Location {
  id: string;
  nome: string;
  descricao?: string;
  endereco: string;
  created_at: string;
}

export interface Trade {
  id: string;
  proponente_id: string;
  receptor_id: string;
  objeto_oferecido_id: string;
  objeto_desejado_id: string;
  location_id?: string;
  status: TradeStatus;
  mensagem?: string;
  created_at: string;
  updated_at: string;
  proponente?: Profile;
  receptor?: Profile;
  objeto_oferecido?: Object;
  objeto_desejado?: Object;
  location?: Location;
}

export interface Rating {
  id: string;
  avaliador_id: string;
  avaliado_id: string;
  trade_id: string;
  nota: number;
  comentario?: string;
  created_at: string;
  avaliador?: Profile;
}

export interface Message {
  id: string;
  trade_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: Profile;
}
