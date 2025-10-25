"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { Plus, Edit, Trash2, Save, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AdminRankBoostPage() {
  const router = useRouter();
  const [rankBoosts, setRankBoosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [rankBoostForm, setRankBoostForm] = useState({
    id: "",
    title: "",
    price: "",
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

  // Memoized fetch function
  const fetchData = useCallback(
    async (p = 1) => {
      try {
        setLoading(true);
        const from = (p - 1) * pageSize;
        const to = p * pageSize - 1;

        const { data, count, error } = await supabase
          .from("rank_boost")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) throw error;

        setRankBoosts(data || []);
        setTotal((count as number) || 0);
      } catch (error) {
        console.error("Error fetching rank boosts:", error);
        toast.error("Error fetching rank boosts");
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  // Fetch when page changes
  useEffect(() => {
    fetchData(page);
  }, [page, fetchData]);

  const handleRankBoostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const rankBoostData = {
        title: rankBoostForm.title,
        price: parseInt(rankBoostForm.price) || 0,
      };

      if (isEditing && rankBoostForm.id) {
        const { error } = await supabase
          .from("rank_boost")
          .update(rankBoostData)
          .eq("id", rankBoostForm.id);
        if (error) throw error;
        toast.success("Rank boost updated successfully");
      } else {
        const { error } = await supabase
          .from("rank_boost")
          .insert(rankBoostData);
        if (error) throw error;
        toast.success("Rank boost created successfully");
      }

      resetRankBoostForm();
      fetchData();
    } catch (error) {
      console.error("Error saving rank boost:", error);
      toast.error("Error saving rank boost");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRankBoost = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this rank boost? This action cannot be undone."
      )
    )
      return;

    try {
      const { error } = await supabase.from("rank_boost").delete().eq("id", id);

      if (error) throw error;
      toast.success("Rank boost deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting rank boost:", error);
      toast.error("Error deleting rank boost");
    }
  };

  const editRankBoost = (rankBoost: any) => {
    setRankBoostForm({
      id: rankBoost.id,
      title: rankBoost.title || "",
      price: rankBoost.price?.toString() || "0",
    });
    setIsEditing(true);
  };

  const resetRankBoostForm = () => {
    setRankBoostForm({
      id: "",
      title: "",
      price: "",
    });
    setIsEditing(false);
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
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">Admin — Rank Boost</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Create/Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Edit className="h-5 w-5" />
                    Edit Rank Boost
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Create New Rank Boost
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRankBoostSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={rankBoostForm.title}
                    onChange={(e) =>
                      setRankBoostForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="e.g., Mythic to Glory, Epic to Legend, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (MMK)</Label>
                  <Input
                    id="price"
                    min="0"
                    value={rankBoostForm.price}
                    onChange={(e) =>
                      setRankBoostForm((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    required
                    placeholder="Enter price in dollars"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? "Update" : "Create"}
                  </Button>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetRankBoostForm}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Rank Boost List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle>Rank Boosts ({total})</CardTitle>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPageSize(parseInt(v, 10));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center text-muted-foreground py-8">
                    Loading rank boosts...
                  </div>
                ) : rankBoosts.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No rank boosts found. Create your first rank boost.
                  </div>
                ) : (
                  rankBoosts.map((rankBoost) => (
                    <div
                      key={rankBoost.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">
                            {rankBoost.title || "Untitled Rank Boost"}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            ${rankBoost.price}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Created:{" "}
                          {new Date(rankBoost.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editRankBoost(rankBoost)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRankBoost(rankBoost.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(page - 1)}
                        disabled={page <= 1}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }).map(
                          (_, i) => {
                            const pageNumber = i + 1;
                            return (
                              <Button
                                key={pageNumber}
                                variant={
                                  pageNumber === page ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => goToPage(pageNumber)}
                                className="w-8 h-8 p-0"
                              >
                                {pageNumber}
                              </Button>
                            );
                          }
                        )}
                        {totalPages > 5 && (
                          <span className="text-sm text-muted-foreground px-2">
                            ...
                          </span>
                        )}
                      </div>
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
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
