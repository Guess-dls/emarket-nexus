import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Link } from "react-router-dom";

interface Banner {
  id: string;
  image_url: string;
  title: string | null;
  link: string | null;
  sub_images: string[] | null;
  expires_at: string | null;
}

const BannerCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center" },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );
  const [banners, setBanners] = useState<Banner[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedSubImage, setSelectedSubImage] = useState<Record<string, number>>({});

  useEffect(() => {
    loadBanners();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const updateButtons = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    emblaApi.on("select", updateButtons);
    updateButtons();

    return () => {
      emblaApi.off("select", updateButtons);
    };
  }, [emblaApi]);

  const loadBanners = async () => {
    const now = new Date().toISOString();
    
    const { data } = await supabase
      .from("banners")
      .select("id, image_url, title, link, sub_images, expires_at")
      .eq("is_active", true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order("position");

    if (data) {
      setBanners(data);
    }
  };

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  const getCurrentImage = (banner: Banner) => {
    const selectedIndex = selectedSubImage[banner.id];
    if (selectedIndex !== undefined && banner.sub_images && banner.sub_images[selectedIndex]) {
      return banner.sub_images[selectedIndex];
    }
    return banner.image_url;
  };

  const getAllImages = (banner: Banner) => {
    const images = [banner.image_url];
    if (banner.sub_images && banner.sub_images.length > 0) {
      images.push(...banner.sub_images);
    }
    return images;
  };

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full">
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner) => {
            const allImages = getAllImages(banner);
            const currentImageIndex = selectedSubImage[banner.id] !== undefined 
              ? selectedSubImage[banner.id] + 1 
              : 0;
            
            return (
              <div key={banner.id} className="flex-[0_0_100%] min-w-0">
                <div className="relative aspect-[16/9] md:aspect-[21/9]">
                  <img
                    src={getCurrentImage(banner)}
                    alt={banner.title || "Bannière promotionnelle"}
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8">
                    {banner.title && (
                      <h3 className="text-white text-xl md:text-3xl font-bold mb-4 drop-shadow-lg">
                        {banner.title}
                      </h3>
                    )}
                    
                    {/* Sub-images thumbnails */}
                    {allImages.length > 1 && (
                      <div className="flex gap-2 mb-4">
                        {allImages.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedSubImage(prev => ({
                              ...prev,
                              [banner.id]: index === 0 ? undefined as any : index - 1
                            }))}
                            className={`w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                              (index === 0 && selectedSubImage[banner.id] === undefined) ||
                              (index > 0 && selectedSubImage[banner.id] === index - 1)
                                ? 'border-primary ring-2 ring-primary/50'
                                : 'border-white/50 hover:border-white'
                            }`}
                          >
                            <img
                              src={img}
                              alt={`Vue ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {banner.link ? (
                      <Link to={banner.link}>
                        <Button size="lg" className="w-fit bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                          <Eye className="h-5 w-5 mr-2" />
                          Voir le produit
                        </Button>
                      </Link>
                    ) : (
                      <Button size="lg" className="w-fit bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg" disabled>
                        <Eye className="h-5 w-5 mr-2" />
                        Voir
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={scrollNext}
            disabled={!canScrollNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Dots indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className="w-2 h-2 rounded-full bg-white/50 hover:bg-white transition-colors"
              onClick={() => emblaApi?.scrollTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;