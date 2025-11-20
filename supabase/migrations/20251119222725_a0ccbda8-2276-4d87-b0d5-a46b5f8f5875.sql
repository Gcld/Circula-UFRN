-- Corrigir search_path da função get_user_rating
CREATE OR REPLACE FUNCTION public.get_user_rating(user_id UUID)
RETURNS NUMERIC 
LANGUAGE sql 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(AVG(nota), 0)::NUMERIC(3,2)
  FROM public.ratings
  WHERE avaliado_id = user_id
$$;

-- Recriar função update_updated_at_column com search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;