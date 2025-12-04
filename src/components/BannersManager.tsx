import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Upload, Image as ImageIcon, GripVertical } from "lucide-react";

interface Banner {
  id: string;
  image_url: string;
  title: string | null;
  link: string | null;
  position: number;
  is_active: boolean;
}

const BannersManager = () => {
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // New banner form
  const [newTitle, setNewTitle] = useState("");
  const [newLink, setNewLink] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadBanners();
  }, []);

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
      // Upload image to storage
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("banners")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("banners")
        .getPublicUrl(filePath);

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
        });

      if (insertError) throw insertError;

      toast({
        title: "Succès",
        description: "Bannière ajoutée avec succès",
      });

      // Reset form
      setNewTitle("");
      setNewLink("");
      setSelectedFile(null);
      setPreviewUrl(null);
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

  const updateBannerField = async (bannerId: string, field: string, value: string) => {
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
              <Label htmlFor="banner-image">Image (16:9 recommandé)</Label>
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

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="banner-link">Lien (optionnel)</Label>
              <Input
                id="banner-link"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="Ex: /category/electronique"
              />
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
                  className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
                >
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
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BannersManager;
