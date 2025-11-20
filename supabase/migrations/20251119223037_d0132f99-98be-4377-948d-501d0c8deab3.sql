-- RLS Policies para o bucket de imagens (o bucket será criado via UI)
CREATE POLICY "Imagens são públicas" ON storage.objects 
  FOR SELECT TO public 
  USING (bucket_id = 'object-images');

CREATE POLICY "Upload autenticado" ON storage.objects 
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'object-images');

CREATE POLICY "Atualizar próprias imagens" ON storage.objects 
  FOR UPDATE TO authenticated 
  USING (bucket_id = 'object-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Deletar próprias imagens" ON storage.objects 
  FOR DELETE TO authenticated 
  USING (bucket_id = 'object-images' AND auth.uid()::text = (storage.foldername(name))[1]);