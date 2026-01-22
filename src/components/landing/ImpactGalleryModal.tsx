import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImpactGalleryPreviewProps {
  images: string[];
  isHovered: boolean;
}

export const ImpactGalleryPreview = ({ images, isHovered }: ImpactGalleryPreviewProps) => {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl">
      {/* Stacked colorless layer preview - minimal cards behind */}
      <div className="absolute inset-0 flex items-center justify-center">
        {images.slice(0, 4).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-xl border border-border/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: isHovered ? 0.5 - (i * 0.1) : 0.15 - (i * 0.03),
              scale: 1 - (i * 0.04),
              x: i * 6,
              y: i * 6,
            }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
            style={{
              width: '70%',
              height: '60%',
              zIndex: 4 - i,
              background: `linear-gradient(135deg, hsl(var(--muted) / ${0.6 - i * 0.1}) 0%, hsl(var(--muted) / ${0.3 - i * 0.05}) 100%)`,
            }}
          />
        ))}
      </div>
      
      {/* Gallery indicator on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-full border border-border/50 shadow-lg z-10"
          >
            <Images className="w-3.5 h-3.5 text-swap-green" />
            <span className="text-xs font-medium text-foreground">{images.length} photos</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface ImpactGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  images: string[];
}

const ImpactGalleryModal = ({ isOpen, onClose, category, images }: ImpactGalleryModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/90 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative bg-card border border-border/50 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/30">
              <h3 className="text-2xl font-bold text-foreground capitalize">{category} Impact</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Gallery */}
            <div className="relative aspect-video bg-muted/30">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <img
                    src={images[currentIndex]}
                    alt={`${category} impact ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={prev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={next}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}

              {/* Dots indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex 
                        ? "bg-swap-green w-6" 
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Caption */}
            <div className="p-6">
              <p className="text-center text-muted-foreground">
                Image {currentIndex + 1} of {images.length} • {category} community impact
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImpactGalleryModal;
