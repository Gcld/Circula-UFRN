import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ObjectCategory } from '@/types/database';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X } from 'lucide-react';

const CreateObject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria: '' as ObjectCategory,
    condicao: '',
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const categoryLabels: Record<ObjectCategory, string> = {
    livros: 'Livros',
    eletronicos: 'Eletrônicos',
    roupas: 'Roupas',
    acessorios: 'Acessórios',
    moveis: 'Móveis',
    outros: 'Outros',
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast({
        title: 'Limite de imagens',
        description: 'Você pode adicionar no máximo 5 imagens.',
        variant: 'destructive',
      });
      return;
    }

    setImages([...images, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user!.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('object-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('object-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      return uploadedUrls;
    } catch (error: any) {
      console.error('Erro ao fazer upload de imagens:', error);
      throw error;
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo || !formData.descricao || !formData.categoria || !formData.condicao) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Upload de imagens
      const imageUrls = await uploadImages();

      // Criar objeto no banco
      const { data, error } = await supabase
        .from('objects')
        .insert({
          owner_id: user!.id,
          titulo: formData.titulo,
          descricao: formData.descricao,
          categoria: formData.categoria,
          condicao: formData.condicao,
          imagens: imageUrls,
          status: 'disponivel',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Objeto cadastrado!',
        description: 'Seu objeto foi publicado com sucesso.',
      });

      navigate(`/objeto/${data.id}`);
    } catch (error: any) {
      console.error('Erro ao cadastrar objeto:', error);
      toast({
        title: 'Erro ao cadastrar',
        description: 'Ocorreu um erro ao publicar seu objeto.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Cadastrar Novo Objeto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Livro de Cálculo I"
                  required
                  disabled={isLoading}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value as ObjectCategory })}
                  disabled={isLoading}
                >
                  <SelectTrigger id="categoria">
                    <SelectValue placeholder="Selecione uma categoria" />
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

              <div className="space-y-2">
                <Label htmlFor="condicao">Condição *</Label>
                <Input
                  id="condicao"
                  value={formData.condicao}
                  onChange={(e) => setFormData({ ...formData, condicao: e.target.value })}
                  placeholder="Ex: Novo, Usado, Bom estado..."
                  required
                  disabled={isLoading}
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva o objeto em detalhes..."
                  required
                  disabled={isLoading}
                  rows={5}
                  maxLength={1000}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Imagens (até 5)</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={isLoading || uploadingImages}
                  className="cursor-pointer"
                />
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                        <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || uploadingImages}>
                {isLoading || uploadingImages ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploadingImages ? 'Enviando imagens...' : 'Cadastrando...'}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Publicar Objeto
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateObject;
