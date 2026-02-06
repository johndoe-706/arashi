"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      const response = await fetch("/api/admin/session");
      if (!response.ok) return router.replace("/admin/login");
      fetchData();
    };
    check();
  }, [router]);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/admin/ads");
      if (!response.ok) throw new Error("Failed to fetch ads");
      const payload = await response.json();
      setAds(payload.data || []);
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

      console.log("Uploading image to local storage");

      // Upload to Supabase Storage
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "ads");

      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        console.error("Upload error:", payload?.error);
        throw new Error(payload?.error || "Upload failed");
      }

      console.log("Image uploaded successfully:", payload.url);
      toast.success("Image uploaded successfully");
      return payload.url;
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
        const response = await fetch(`/api/admin/ads/${adForm.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(adData),
        });
        if (!response.ok) throw new Error("Failed to update ad");
        toast.success("Ad updated");
      } else {
        const response = await fetch("/api/admin/ads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ad: adData }),
        });
        if (!response.ok) throw new Error("Failed to create ad");
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

  const deleteAd = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;

    try {
      const response = await fetch(`/api/admin/ads/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete ad");

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
                      onClick={() => deleteAd(ad.id)}
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
