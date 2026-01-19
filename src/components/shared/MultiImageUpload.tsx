import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, X, Loader2, Image as ImageIcon } from "lucide-react";

interface MultiImageUploadProps {
  bucket: "submissions" | "listings";
  values: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
  className?: string;
}

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  bucket,
  values,
  onChange,
  maxImages = 6,
  disabled = false,
  className,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check remaining slots
    const remainingSlots = maxImages - values.length;
    const filesToUpload = files.slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate all files
    for (const file of filesToUpload) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload only image files");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Each image must be less than 5MB");
        return;
      }
    }

    setIsUploading(true);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const newUrls = await Promise.all(uploadPromises);
      onChange([...values, ...newUrls]);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemove = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
  };

  const canAddMore = values.length < maxImages;

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
        disabled={disabled || isUploading || !canAddMore}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Existing Images */}
        {values.map((url, index) => (
          <div key={index} className="relative group aspect-square">
            <div className="h-full w-full overflow-hidden rounded-lg border border-border bg-muted">
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              disabled={disabled}
              className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {/* Add More Button */}
        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || isUploading}
            className={cn(
              "flex flex-col items-center justify-center gap-2 aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-muted/50 transition-colors",
              (disabled || isUploading) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Plus className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Add Photo
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {values.length}/{maxImages} photos uploaded
      </p>
    </div>
  );
};
