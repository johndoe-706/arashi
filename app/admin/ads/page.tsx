"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Save, Edit, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function AdminAdsPage() {
  const router = useRouter();
  const [ads, setAds] = useState<any[]>([]);
  const [adForm, setAdForm] = useState({
    id: "",
    title: "",
    image_url: "",
    link: "",
    order_index: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      const session = (data as any)?.session;
      if (!session) return router.replace("/admin/login");
      fetchData();
    };
    check();
  }, [router]);

  const fetchData = async () => {
    try {
      const { data } = await supabase
        .from("ads")
        .select("*")
        .order("order_index");
      setAds(data || []);
    } catch (err) {
      console.error("Error fetching ads", err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setSelectedFile(file);

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      setUploading(true);

      // Generate unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()
        .toString(36)
        .substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = fileName;

      console.log("Uploading to bucket: ads-images");

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("ads-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Supabase upload error:", error);
        throw error;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("ads-images").getPublicUrl(filePath);

      console.log("Image uploaded successfully:", publicUrl);
      toast.success("Image uploaded successfully");
      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!adForm.order_index) {
      toast.error("Please enter an order index");
      return;
    }

    if (!selectedFile && !adForm.image_url) {
      toast.error("Please select an image");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = adForm.image_url;

      // Upload new image if selected
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      const adData = {
        title: adForm.title,
        image_url: imageUrl,
        link: adForm.link || null,
        order_index: parseInt(adForm.order_index),
        is_active: true,
      };

      if (adForm.id) {
        const { error } = await supabase
          .from("ads")
          .update(adData)
          .eq("id", adForm.id);
        if (error) throw error;
        toast.success("Ad updated");
      } else {
        const { error } = await supabase.from("ads").insert(adData);
        if (error) throw error;
        toast.success("Ad created");
      }

      // Reset form
      resetForm();
      fetchData();
    } catch (err) {
      console.error("Error saving ad", err);
      toast.error("Error saving ad");
    } finally {
      setLoading(false);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setImagePreview("");
  };

  const editAd = (ad: any) => {
    setAdForm({
      id: ad.id,
      title: ad.title || "",
      image_url: ad.image_url,
      link: ad.link || "",
      order_index: ad.order_index.toString(),
    });
    setImagePreview(ad.image_url);
  };

  const deleteAd = async (id: string, imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;

    try {
      // Delete image from storage first if it exists
      if (imageUrl) {
        try {
          // Extract file name from URL
          let fileName: string;

          try {
            // Try using URL constructor for proper URL parsing
            const urlObj = new URL(imageUrl);
            const pathParts = urlObj.pathname.split("/");
            fileName = pathParts[pathParts.length - 1];
          } catch {
            // Fallback: simple string splitting for malformed URLs
            const urlParts = imageUrl.split("/");
            fileName = urlParts[urlParts.length - 1];
          }

          console.log("File to delete:", fileName);
          console.log("Full image URL:", imageUrl);

          if (fileName && fileName.length > 0) {
            const { error: deleteStorageError } = await supabase.storage
              .from("ads-images")
              .remove([fileName]);

            if (deleteStorageError) {
              console.warn(
                `Failed to delete image from storage for ad ${id}:`,
                deleteStorageError
              );
              // Continue with database deletion even if storage deletion fails
            } else {
              console.log(`Deleted image from storage for ad ${id}`);
            }
          }
        } catch (storageError) {
          console.warn("Error deleting from storage:", storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete the ad from database
      const { error } = await supabase.from("ads").delete().eq("id", id);
      if (error) throw error;

      toast.success("Ad deleted successfully");
      fetchData();
    } catch (err) {
      console.error("Error deleting ad:", err);
      toast.error("Error deleting ad");
    }
  };

  const resetForm = () => {
    setAdForm({
      id: "",
      title: "",
      image_url: "",
      link: "",
      order_index: "",
    });
    setSelectedFile(null);
    setImagePreview("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin — Ads</h1>

        <Card>
          <CardHeader>
            <CardTitle>{adForm.id ? "Edit Ad" : "Create New Ad"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ad-title">Title (Optional)</Label>
                  <Input
                    id="ad-title"
                    value={adForm.title}
                    required
                    onChange={(e) =>
                      setAdForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Enter ad title"
                  />
                </div>
                <div>
                  <Label htmlFor="order">Order Index *</Label>
                  <Input
                    id="order"
                    type="number"
                    value={adForm.order_index}
                    onChange={(e) =>
                      setAdForm((prev) => ({
                        ...prev,
                        order_index: e.target.value,
                      }))
                    }
                    placeholder="Display order"
                    required
                  />
                </div>
              </div>

              {/* Image Upload Section */}
              <div>
                <Label htmlFor="image-upload">Ad Image *</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <div className="w-48 h-32 relative border rounded-lg overflow-hidden">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                        onClick={removeSelectedFile}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <Label
                        htmlFor="image-upload"
                        className="cursor-pointer text-sm text-muted-foreground"
                      >
                        Click to upload image
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          disabled={uploading}
                        />
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, GIF up to 5MB
                      </p>
                      {uploading && (
                        <p className="text-xs text-blue-500 mt-1">
                          Uploading...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="link">Link (Optional)</Label>
                <Input
                  id="link"
                  value={adForm.link}
                  onChange={(e) =>
                    setAdForm((prev) => ({ ...prev, link: e.target.value }))
                  }
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading || uploading}
                  className="flex items-center gap-2"
                >
                  {loading || uploading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {adForm.id ? "Update" : "Create"}
                </Button>
                {(adForm.id || selectedFile) && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Ads List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ads.map((ad) => (
                <div
                  key={ad.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 relative rounded overflow-hidden">
                      <Image
                        src={ad.image_url}
                        alt={ad.title || "Ad image"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {ad.title || "Untitled Ad"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Order: {ad.order_index} •{" "}
                        {ad.link ? "Has link" : "No link"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editAd(ad)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAd(ad.id, ad.image_url)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
