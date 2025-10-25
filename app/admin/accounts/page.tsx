"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { COLLECTOR_LEVELS, CATEGORIES } from "@/lib/constants";
import {
  CreditCard as Edit,
  Trash2,
  Save,
  Clock,
  Undo,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function AdminAccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [accountForm, setAccountForm] = useState({
    id: "",
    title: "",
    description: "",
    price: "",
    skins: "0",
    collector_level: "",
    images: [] as string[],
  });

  const [isEditing, setIsEditing] = useState(false);

  // Check auth once on mount
  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      const session = (data as any)?.session;
      if (!session) return router.replace("/admin/login");
    };
    check();
  }, [router]);

  // Memoized fetch function so it can be used safely in effects
  const fetchData = useCallback(
    async (p = 1, category: string | null = null) => {
      try {
        setLoading(true);
        const from = (p - 1) * pageSize;
        const to = p * pageSize - 1;

        let query = supabase
          .from("accounts")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(from, to);

        const { data, count, error } = await query;
        if (error) throw error;

        setAccounts(data || []);
        setTotal((count as number) || 0);
      } catch (error) {
        console.error("Error fetching accounts:", error);
        toast.error("Error fetching accounts");
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  // Fetch when page or category changes
  useEffect(() => {
    fetchData(page);
  }, [page, fetchData]);

  // Function to calculate time remaining until permanent deletion
  const getTimeRemaining = (deletedAt: string) => {
    const deletedTime = new Date(deletedAt).getTime();
    const now = new Date().getTime();
    const timeDiff = deletedTime + 24 * 60 * 60 * 1000 - now; // 24 hours in milliseconds

    if (timeDiff <= 0) return { hoursRemaining: 0, minutesRemaining: 0 };

    const hoursRemaining = Math.floor(timeDiff / (60 * 60 * 1000));
    const minutesRemaining = Math.floor(
      (timeDiff % (60 * 60 * 1000)) / (60 * 1000)
    );

    return { hoursRemaining, minutesRemaining };
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const accountData = {
        title: accountForm.title,
        description: accountForm.description,
        price: parseFloat(accountForm.price),
        skins: parseInt(accountForm.skins) || 0,
        collector_level: accountForm.collector_level || null,
        images: accountForm.images,
      };

      if (isEditing && accountForm.id) {
        const { error } = await supabase
          .from("accounts")
          .update(accountData)
          .eq("id", accountForm.id);
        if (error) throw error;
        toast.success("Account updated successfully");
      } else {
        const { error } = await supabase.from("accounts").insert(accountData);
        if (error) throw error;
        toast.success("Account created successfully");
      }

      resetAccountForm();
      fetchData();
    } catch (error) {
      console.error("Error saving account:", error);
      toast.error("Error saving account");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to mark this account for deletion? It will show as 'Sold Out' for 24 hours before being permanently deleted along with its images."
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("accounts")
        .update({
          is_sold: true,
          sold_at: new Date().toISOString(),
          deleted_at: new Date().toISOString(), // Mark for deletion
        })
        .eq("id", id);

      if (error) throw error;
      toast.success(
        "Account marked for deletion. It will be permanently deleted in 24 hours along with its images."
      );
      fetchData();
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Error marking account for deletion");
    }
  };

  // Function to restore an account (remove from deletion queue)
  const restoreAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from("accounts")
        .update({
          is_sold: false,
          sold_at: null,
          deleted_at: null, // Remove deletion mark
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("Account restored successfully");
      fetchData();
    } catch (error) {
      console.error("Error restoring account:", error);
      toast.error("Error restoring account");
    }
  };

  // Function to delete account permanently immediately
  const deleteAccountPermanently = async (id: string, images: string[]) => {
    if (
      !confirm(
        "Are you sure you want to delete this account permanently? This action cannot be undone and all images will be deleted from storage."
      )
    )
      return;

    try {
      // Delete images from storage first
      if (images && images.length > 0) {
        const fileNames = images
          .map((url: string) => {
            const urlParts = url.split("/");
            return urlParts[urlParts.length - 1];
          })
          .filter(Boolean);

        if (fileNames.length > 0) {
          const { error: deleteStorageError } = await supabase.storage
            .from("accounts-images")
            .remove(fileNames);

          if (deleteStorageError) {
            console.warn(
              `Failed to delete some images for account ${id}:`,
              deleteStorageError
            );
          } else {
            console.log(`Deleted ${fileNames.length} images for account ${id}`);
          }
        }
      }

      // Delete the account from database
      const { error } = await supabase.from("accounts").delete().eq("id", id);

      if (error) throw error;

      toast.success("Account permanently deleted");
      fetchData();
    } catch (error) {
      console.error("Error deleting account permanently:", error);
      toast.error("Error deleting account");
    }
  };

  // Function to manually clean up expired accounts and their images
  const cleanupExpiredAccounts = async () => {
    try {
      const twentyFourHoursAgo = new Date(
        Date.now() - 24 * 60 * 60 * 1000
      ).toISOString();

      const { data: expiredAccounts, error: fetchError } = await supabase
        .from("accounts")
        .select("id, images")
        .lt("deleted_at", twentyFourHoursAgo);

      if (fetchError) throw fetchError;

      if (!expiredAccounts || expiredAccounts.length === 0) {
        toast.info("No expired accounts to clean up");
        return;
      }

      let totalImagesDeleted = 0;
      let accountsDeleted = 0;

      for (const account of expiredAccounts) {
        try {
          // Delete images from storage
          if (account.images && account.images.length > 0) {
            const fileNames = account.images
              .map((url: string) => {
                const urlParts = url.split("/");
                return urlParts[urlParts.length - 1];
              })
              .filter(Boolean); // Remove any empty strings

            if (fileNames.length > 0) {
              const { error: deleteStorageError } = await supabase.storage
                .from("accounts-images")
                .remove(fileNames);

              if (deleteStorageError) {
                console.warn(
                  `Failed to delete some images for account ${account.id}:`,
                  deleteStorageError
                );
              } else {
                totalImagesDeleted += fileNames.length;
                console.log(
                  `Deleted ${fileNames.length} images for account ${account.id}`
                );
              }
            }
          }

          // Delete the account from database
          const { error: deleteAccountError } = await supabase
            .from("accounts")
            .delete()
            .eq("id", account.id);

          if (deleteAccountError) {
            console.error(
              `Failed to delete account ${account.id}:`,
              deleteAccountError
            );
          } else {
            accountsDeleted++;
          }
        } catch (accountError) {
          console.error(
            `Error processing account ${account.id}:`,
            accountError
          );
          // Continue with next account even if this one fails
        }
      }

      if (accountsDeleted > 0) {
        toast.success(
          `Cleaned up ${accountsDeleted} accounts and ${totalImagesDeleted} images`
        );
      } else {
        toast.info("No accounts were deleted during cleanup");
      }

      fetchData();
    } catch (error) {
      console.error("Cleanup error:", error);
      toast.error("Error cleaning up expired accounts");
    }
  };

  const editAccount = (account: any) => {
    // Don't allow editing if account is marked for deletion
    if (account.deleted_at) {
      toast.error("Cannot edit an account that is marked for deletion");
      return;
    }

    setAccountForm({
      id: account.id,
      title: account.title,
      description: account.description,
      price: account.price.toString(),
      skins: account.skins?.toString() || "0",
      collector_level: account.collector_level || "",
      images: account.images,
    });
    setIsEditing(true);
  };

  const resetAccountForm = () => {
    setAccountForm({
      id: "",
      title: "",
      description: "",
      price: "",
      skins: "0",

      collector_level: "",
      images: [],
    });
    setIsEditing(false);
  };

  // Updated handleImageUpload to handle multiple files
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error(`File ${file.name} is not an image`);
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large (max 5MB)`);
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("accounts-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("accounts-images")
          .getPublicUrl(fileName);

        return data.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // Add all new images to the form
      setAccountForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));

      toast.success(`Successfully uploaded ${uploadedUrls.length} images`);

      // Clear the file input
      e.target.value = "";
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Function to remove an image from the form
  const removeImage = (index: number) => {
    const newImages = [...accountForm.images];
    newImages.splice(index, 1);
    setAccountForm((prev) => ({ ...prev, images: newImages }));
  };

  // Function to replace an image
  const replaceImage = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const file = files[0];

      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("accounts-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("accounts-images")
        .getPublicUrl(fileName);

      const newImages = [...accountForm.images];
      newImages[index] = data.publicUrl;
      setAccountForm((prev) => ({ ...prev, images: newImages }));

      toast.success("Image replaced successfully");

      // Clear the file input
      e.target.value = "";
    } catch (error) {
      console.error("Replace image error:", error);
      toast.error("Failed to replace image");
    } finally {
      setUploading(false);
    }
  };

  // Pagination helpers
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    fetchData(p);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin — Accounts</h1>
          <Button
            variant="outline"
            onClick={cleanupExpiredAccounts}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Cleanup Expired
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? "Edit Account" : "Create New Account"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={accountForm.title}
                    onChange={(e) =>
                      setAccountForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={accountForm.description}
                  onChange={(e) =>
                    setAccountForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={accountForm.price}
                    onChange={(e) =>
                      setAccountForm((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="skins">Skins Count</Label>
                  <Input
                    id="skins"
                    type="number"
                    min="0"
                    value={accountForm.skins}
                    onChange={(e) =>
                      setAccountForm((prev) => ({
                        ...prev,
                        skins: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="collector_level">Collector Level</Label>
                  <Select
                    value={accountForm.collector_level}
                    onValueChange={(v) =>
                      setAccountForm((prev) => ({
                        ...prev,
                        collector_level: v,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLLECTOR_LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Images</Label>
                <div className="space-y-4">
                  {/* Multiple Image Upload */}
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {uploading
                            ? "Uploading..."
                            : "Click to upload multiple images"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Select multiple images at once (max 5MB each)
                        </p>
                      </div>
                    </Label>
                  </div>

                  {/* Image Preview Grid */}
                  {accountForm.images.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">
                        Uploaded Images ({accountForm.images.length})
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                        {accountForm.images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border">
                              <Image
                                src={img}
                                alt={`Preview ${idx + 1}`}
                                width={150}
                                height={150}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {/* Replace button */}
                              <label className="cursor-pointer">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => replaceImage(idx, e)}
                                  disabled={uploading}
                                  className="hidden"
                                  id={`replace-${idx}`}
                                />
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="secondary"
                                  className="h-6 w-6 bg-blue-500 hover:bg-blue-600 text-white"
                                  asChild
                                >
                                  <span>
                                    <Upload className="h-3 w-3" />
                                  </span>
                                </Button>
                              </label>
                              {/* Remove button */}
                              <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="h-6 w-6"
                                onClick={() => removeImage(idx)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-xs text-center mt-1 text-muted-foreground">
                              Image {idx + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading || uploading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Update" : "Create"}
                </Button>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetAccountForm}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPageSize(parseInt(v, 10));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-center text-muted-foreground py-8">
                  Loading accounts...
                </p>
              ) : accounts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No accounts found. Create your first account above.
                </p>
              ) : (
                accounts.map((account) => {
                  const isMarkedForDeletion = account.deleted_at;
                  const timeRemaining = isMarkedForDeletion
                    ? getTimeRemaining(account.deleted_at)
                    : null;

                  return (
                    <div
                      key={account.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        isMarkedForDeletion
                          ? "bg-amber-50 border-amber-200"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{account.title}</h3>
                          {account.is_sold && (
                            <Badge variant="secondary" className="text-xs">
                              Sold Out
                            </Badge>
                          )}
                          {isMarkedForDeletion && (
                            <Badge
                              variant="destructive"
                              className="text-xs flex items-center gap-1"
                            >
                              <Clock className="h-3 w-3" />
                              Deleting in {timeRemaining?.hoursRemaining}h{" "}
                              {timeRemaining?.minutesRemaining}m
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {
                            CATEGORIES[
                              account.category as keyof typeof CATEGORIES
                            ]
                          }{" "}
                          • ${account.price}
                          {account.skins > 0 && ` • ${account.skins} skins`}
                        </p>
                        {account.collector_level && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {account.collector_level}
                          </Badge>
                        )}
                        {account.images && account.images.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {account.images.length} image(s)
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!isMarkedForDeletion ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editAccount(account)}
                              disabled={account.is_sold}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAccount(account.id)}
                              disabled={account.is_sold}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            {/* Delete Now button - permanently deletes immediately */}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                deleteAccountPermanently(
                                  account.id,
                                  account.images
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => restoreAccount(account.id)}
                            className="flex items-center gap-1"
                          >
                            <Undo className="h-3 w-3" />
                            Restore
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              {/* Pagination controls */}
              <div className="flex items-center justify-between mt-4">
                <div>
                  Page {page} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                  >
                    Prev
                  </Button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Button
                      key={i}
                      variant={i + 1 === page ? undefined : "ghost"}
                      size="sm"
                      onClick={() => goToPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
