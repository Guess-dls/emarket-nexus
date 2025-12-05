import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Upload, Image as ImageIcon, GripVertical, X, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Category {
  id: string;
  nom: string;
  slug: string;
}

interface Banner {
  id: string;
  image_url: string;
  title: string | null;
  link: string | null;
  position: number;
  is_active: boolean;
  id_categorie: string | null;
  sub_images: string[] | null;
  expires_at: string | null;
}

const BannersManager = () => {
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // New banner form
  const [newTitle, setNewTitle] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newCategory, setNewCategory] = useState<string>("");
  const [newExpiresAt, setNewExpiresAt] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [subImageFiles, setSubImageFiles] = useState<File[]>([]);
  const [subImagePreviews, setSubImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    loadBanners();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("id, nom, slug")
      .order("nom");
    
    if (data) {
      setCategories(data);
    }
  };

  const loadBanners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("position");

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les bannières",
        variant: "destructive",
      });
    } else {
      setBanners(data || []);
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSubImageFiles(prev => [...prev, ...files].slice(0, 5));
      const newPreviews = files.map(f => URL.createObjectURL(f));
      setSubImagePreviews(prev => [...prev, ...newPreviews].slice(0, 5));
    }
  };

  const removeSubImage = (index: number) => {
    setSubImageFiles(prev => prev.filter((_, i) => i !== index));
    setSubImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadBanner = async () => {
    if (!selectedFile) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload main image to storage
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("banners")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL for main image
      const { data: { publicUrl } } = supabase.storage
        .from("banners")
        .getPublicUrl(filePath);

      // Upload sub-images
      const subImageUrls: string[] = [];
      for (const subFile of subImageFiles) {
        const subExt = subFile.name.split(".").pop();
        const subFileName = `${Date.now()}_sub_${Math.random().toString(36).substring(7)}.${subExt}`;
        const subFilePath = `banners/${subFileName}`;

        const { error: subUploadError } = await supabase.storage
          .from("banners")
          .upload(subFilePath, subFile);

        if (!subUploadError) {
          const { data: { publicUrl: subPublicUrl } } = supabase.storage
            .from("banners")
            .getPublicUrl(subFilePath);
          subImageUrls.push(subPublicUrl);
        }
      }

      // Get next position
      const nextPosition = banners.length > 0 
        ? Math.max(...banners.map(b => b.position)) + 1 
        : 0;

      // Insert banner record
      const { error: insertError } = await supabase
        .from("banners")
        .insert({
          image_url: publicUrl,
          title: newTitle || null,
          link: newLink || null,
          position: nextPosition,
          is_active: true,
          id_categorie: newCategory || null,
          sub_images: subImageUrls.length > 0 ? subImageUrls : null,
          expires_at: newExpiresAt || null,
        });

      if (insertError) throw insertError;

      toast({
        title: "Succès",
        description: "Bannière ajoutée avec succès",
      });

      // Reset form
      setNewTitle("");
      setNewLink("");
      setNewCategory("");
      setNewExpiresAt("");
      setSelectedFile(null);
      setPreviewUrl(null);
      setSubImageFiles([]);
      setSubImagePreviews([]);
      loadBanners();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter la bannière",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteBanner = async (banner: Banner) => {
    try {
      // Extract file path from URL
      const urlParts = banner.image_url.split("/");
      const filePath = `banners/${urlParts[urlParts.length - 1]}`;

      // Delete from storage
      await supabase.storage.from("banners").remove([filePath]);

      // Delete sub-images from storage
      if (banner.sub_images && banner.sub_images.length > 0) {
        const subPaths = banner.sub_images.map(url => {
          const parts = url.split("/");
          return `banners/${parts[parts.length - 1]}`;
        });
        await supabase.storage.from("banners").remove(subPaths);
      }

      // Delete from database
      const { error } = await supabase
        .from("banners")
        .delete()
        .eq("id", banner.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Bannière supprimée",
      });

      loadBanners();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la bannière",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (banner: Banner) => {
    const { error } = await supabase
      .from("banners")
      .update({ is_active: !banner.is_active })
      .eq("id", banner.id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la bannière",
        variant: "destructive",
      });
    } else {
      loadBanners();
    }
  };

  const updateBannerField = async (bannerId: string, field: string, value: string | null) => {
    const { error } = await supabase
      .from("banners")
      .update({ [field]: value || null })
      .eq("id", bannerId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour",
        variant: "destructive",
      });
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null;
    const cat = categories.find(c => c.id === categoryId);
    return cat?.nom || null;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Bannières Publicitaires
        </CardTitle>
        <CardDescription>
          Gérez les bannières qui s'affichent en carousel sur la page d'accueil (max 10)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new banner form */}
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Ajouter une bannière
          </h4>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="banner-image">Image principale (16:9 recommandé)</Label>
              <Input
                id="banner-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="banner-title">Titre (optionnel)</Label>
              <Input
                id="banner-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Nouvelle collection"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner-category">Catégorie</Label>
              <Select value={newCategory || "none"} onValueChange={(val) => setNewCategory(val === "none" ? "" : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune catégorie</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner-expires">Date d'expiration</Label>
              <Input
                id="banner-expires"
                type="datetime-local"
                value={newExpiresAt}
                onChange={(e) => setNewExpiresAt(e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="banner-link">Lien (optionnel)</Label>
              <Input
                id="banner-link"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="Ex: /category/electronique ou /product/slug"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="sub-images">Sous-images (max 5)</Label>
              <Input
                id="sub-images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleSubImagesChange}
                disabled={subImageFiles.length >= 5}
              />
              {subImagePreviews.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {subImagePreviews.map((preview, index) => (
                    <div key={index} className="relative w-20 h-20 rounded overflow-hidden border">
                      <img src={preview} alt={`Sub ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeSubImage(index)}
                        className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {previewUrl && (
            <div className="relative aspect-[21/9] rounded-lg overflow-hidden border">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <Button 
            onClick={uploadBanner} 
            disabled={!selectedFile || uploading || banners.length >= 10}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Téléchargement..." : "Ajouter la bannière"}
          </Button>
          
          {banners.length >= 10 && (
            <p className="text-sm text-destructive">
              Limite de 10 bannières atteinte. Supprimez-en une pour en ajouter.
            </p>
          )}
        </div>

        {/* Existing banners list */}
        <div className="space-y-3">
          <h4 className="font-medium">Bannières actives ({banners.length}/10)</h4>
          
          {banners.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aucune bannière. Ajoutez-en une pour commencer.
            </p>
          ) : (
            <div className="space-y-3">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`flex flex-col gap-3 p-3 border rounded-lg ${
                    isExpired(banner.expires_at) ? 'bg-destructive/10 border-destructive/30' : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    
                    <span className="text-sm font-medium w-6">{index + 1}</span>
                    
                    <div className="w-24 h-14 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={banner.image_url}
                        alt={banner.title || "Bannière"}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-1 min-w-0">
                      <Input
                        value={banner.title || ""}
                        onChange={(e) => updateBannerField(banner.id, "title", e.target.value)}
                        onBlur={() => loadBanners()}
                        placeholder="Titre"
                        className="h-8"
                      />
                      <Input
                        value={banner.link || ""}
                        onChange={(e) => updateBannerField(banner.id, "link", e.target.value)}
                        onBlur={() => loadBanners()}
                        placeholder="Lien"
                        className="h-8"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={banner.is_active}
                        onCheckedChange={() => toggleActive(banner)}
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteBanner(banner)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Additional info row */}
                  <div className="flex flex-wrap items-center gap-4 text-sm pl-14">
                    <div className="flex items-center gap-2">
                      <Label className="text-muted-foreground">Catégorie:</Label>
                      <Select 
                        value={banner.id_categorie || "none"} 
                        onValueChange={(value) => updateBannerField(banner.id, "id_categorie", value === "none" ? null : value)}
                      >
                        <SelectTrigger className="h-8 w-40">
                          <SelectValue placeholder="Aucune" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucune</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="datetime-local"
                        value={banner.expires_at ? banner.expires_at.slice(0, 16) : ""}
                        onChange={(e) => updateBannerField(banner.id, "expires_at", e.target.value || null)}
                        className="h-8 w-48"
                      />
                      {isExpired(banner.expires_at) && (
                        <span className="text-destructive font-medium">Expirée</span>
                      )}
                    </div>

                    {banner.sub_images && banner.sub_images.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Sous-images:</span>
                        <div className="flex gap-1">
                          {banner.sub_images.map((img, i) => (
                            <div key={i} className="w-8 h-8 rounded overflow-hidden border">
                              <img src={img} alt={`Sub ${i + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BannersManager;
