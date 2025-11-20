-- Enum para tipos de objetos
CREATE TYPE object_category AS ENUM ('livros', 'eletronicos', 'roupas', 'acessorios', 'moveis', 'outros');

-- Enum para status de objetos
CREATE TYPE object_status AS ENUM ('disponivel', 'em_negociacao', 'trocado');

-- Enum para status de trocas
CREATE TYPE trade_status AS ENUM ('pendente', 'aceita', 'recusada', 'concluida', 'cancelada');

-- Enum para tipos de roles
CREATE TYPE app_role AS ENUM ('admin', 'user');

-- Tabela de perfis de usuários (vinculada ao auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nome_completo TEXT NOT NULL,
  matricula TEXT UNIQUE,
  curso TEXT,
  avatar_url TEXT,
  bio TEXT,
  telefone TEXT,
  vinculo_ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de roles de usuários
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

-- Tabela de objetos
CREATE TABLE public.objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria object_category NOT NULL,
  condicao TEXT NOT NULL,
  imagens TEXT[] DEFAULT ARRAY[]::TEXT[],
  status object_status DEFAULT 'disponivel',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de locais de troca
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  endereco TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de propostas de troca
CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proponente_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receptor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  objeto_oferecido_id UUID REFERENCES public.objects(id) ON DELETE CASCADE NOT NULL,
  objeto_desejado_id UUID REFERENCES public.objects(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  status trade_status DEFAULT 'pendente',
  mensagem TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT different_users CHECK (proponente_id != receptor_id),
  CONSTRAINT different_objects CHECK (objeto_oferecido_id != objeto_desejado_id)
);

-- Tabela de avaliações
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliador_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  avaliado_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  trade_id UUID REFERENCES public.trades(id) ON DELETE CASCADE NOT NULL,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(avaliador_id, avaliado_id, trade_id),
  CONSTRAINT different_user_rating CHECK (avaliador_id != avaliado_id)
);

-- Tabela de mensagens do chat
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID REFERENCES public.trades(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_objects_owner ON public.objects(owner_id);
CREATE INDEX idx_objects_status ON public.objects(status);
CREATE INDEX idx_objects_categoria ON public.objects(categoria);
CREATE INDEX idx_trades_proponente ON public.trades(proponente_id);
CREATE INDEX idx_trades_receptor ON public.trades(receptor_id);
CREATE INDEX idx_trades_status ON public.trades(status);
CREATE INDEX idx_messages_trade ON public.messages(trade_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_ratings_avaliado ON public.ratings(avaliado_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_objects_updated_at
  BEFORE UPDATE ON public.objects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trades_updated_at
  BEFORE UPDATE ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil automaticamente ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome_completo)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', 'Usuário')
  );
  
  -- Adicionar role padrão de user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Função para verificar role do usuário (security definer para evitar recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Função para calcular média de avaliações
CREATE OR REPLACE FUNCTION public.get_user_rating(user_id UUID)
RETURNS NUMERIC AS $$
  SELECT COALESCE(AVG(nota), 0)::NUMERIC(3,2)
  FROM public.ratings
  WHERE avaliado_id = user_id
$$ LANGUAGE sql STABLE;

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies para profiles
CREATE POLICY "Perfis são visíveis por todos autenticados"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem deletar seu próprio perfil"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies para user_roles
CREATE POLICY "Roles visíveis para todos autenticados"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Apenas admins podem gerenciar roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para objects
CREATE POLICY "Objetos visíveis para todos autenticados"
  ON public.objects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem criar objetos"
  ON public.objects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Usuários podem atualizar seus próprios objetos"
  ON public.objects FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Usuários podem deletar seus próprios objetos"
  ON public.objects FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- RLS Policies para locations
CREATE POLICY "Locais visíveis para todos autenticados"
  ON public.locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Apenas admins podem gerenciar locais"
  ON public.locations FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para trades
CREATE POLICY "Usuários veem trocas onde estão envolvidos"
  ON public.trades FOR SELECT
  TO authenticated
  USING (auth.uid() = proponente_id OR auth.uid() = receptor_id);

CREATE POLICY "Usuários podem criar propostas"
  ON public.trades FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = proponente_id);

CREATE POLICY "Receptores podem atualizar status da troca"
  ON public.trades FOR UPDATE
  TO authenticated
  USING (auth.uid() = receptor_id OR auth.uid() = proponente_id);

CREATE POLICY "Usuários podem deletar suas propostas"
  ON public.trades FOR DELETE
  TO authenticated
  USING (auth.uid() = proponente_id);

-- RLS Policies para ratings
CREATE POLICY "Avaliações visíveis para todos autenticados"
  ON public.ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem criar avaliações"
  ON public.ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = avaliador_id);

CREATE POLICY "Usuários podem deletar suas avaliações"
  ON public.ratings FOR DELETE
  TO authenticated
  USING (auth.uid() = avaliador_id);

-- RLS Policies para messages
CREATE POLICY "Usuários veem mensagens de suas trocas"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trades
      WHERE trades.id = trade_id
      AND (trades.proponente_id = auth.uid() OR trades.receptor_id = auth.uid())
    )
  );

CREATE POLICY "Usuários podem enviar mensagens em suas trocas"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.trades
      WHERE trades.id = trade_id
      AND (trades.proponente_id = auth.uid() OR trades.receptor_id = auth.uid())
    )
  );

-- Habilitar realtime para mensagens
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;

-- Inserir locais de troca padrão da UFRN
INSERT INTO public.locations (nome, descricao, endereco) VALUES
  ('Biblioteca Central Zila Mamede', 'Ponto de encontro principal do campus', 'Campus Universitário, Lagoa Nova'),
  ('Praça de Convivência', 'Área aberta próxima aos restaurantes universitários', 'Campus Universitário, Lagoa Nova'),
  ('Centro de Convivência', 'Espaço coberto central', 'Campus Universitário, Lagoa Nova'),
  ('Entrada da Reitoria', 'Local de fácil acesso e seguro', 'Campus Universitário, Lagoa Nova');