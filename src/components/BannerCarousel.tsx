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
}

const BannerCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center" },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );
  const [banners, setBanners] = useState<Banner[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

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
    const { data } = await supabase
      .from("banners")
      .select("id, image_url, title, link")
      .eq("is_active", true)
      .order("position");

    if (data) {
      setBanners(data);
    }
  };

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full">
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner) => (
            <div key={banner.id} className="flex-[0_0_100%] min-w-0">
              <div className="relative aspect-[16/9] md:aspect-[21/9]">
                <img
                  src={banner.image_url}
                  alt={banner.title || "Bannière promotionnelle"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8">
                  {banner.title && (
                    <h3 className="text-white text-xl md:text-3xl font-bold mb-4 drop-shadow-lg">
                      {banner.title}
                    </h3>
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
          ))}
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
