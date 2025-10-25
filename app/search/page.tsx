"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { CATEGORIES } from "@/lib/constants";
import { ArrowLeft, Search } from "lucide-react";
import Image from "next/image";

interface Account {
  id: string;
  title: string;
  description: string;
  price: number;
  discount?: number;
  category: string;
  collector_level?: string;
  is_sold?: boolean;
  images: string[];
}

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q");
  const [results, setResults] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchQuery) {
      fetchSearchResults(searchQuery);
    } else {
      setLoading(false);
    }
  }, [searchQuery]);

  const fetchSearchResults = async (query: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .ilike("title", `%${query}%`)
        .eq("is_sold", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error("Search error:", error);
      setError("Failed to load search results");
    } finally {
      setLoading(false);
    }
  };

  const calculateFinalPrice = (price: number, discount?: number) => {
    return discount ? price - (price * discount) / 100 : price;
  };

  if (!searchQuery) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Search</h1>
            <p>Please enter a search term to find accounts.</p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Search Results for "{searchQuery}"
            </h1>
            <p className="text-muted-foreground">
              {loading ? "Searching..." : `Found ${results.length} account(s)`}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Searching for accounts...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => fetchSearchResults(searchQuery)}>
              Try Again
            </Button>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && results.length === 0 && (
          <div className="text-center py-12 space-y-4">
            <Search className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-bold">No accounts found</h2>
            <p className="text-muted-foreground">
              No accounts match your search for "{searchQuery}".
            </p>
            <div className="space-x-4">
              <Button asChild>
                <Link href="/offers">Browse All Accounts</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((account) => {
              const finalPrice = calculateFinalPrice(
                account.price,
                account.discount
              );

              return (
                <Card
                  key={account.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <Link href={`/offers/${account.id}`}>
                    <div className="aspect-video relative overflow-hidden">
                      <Image
                        src={account.images?.[0] || "/placeholder-image.jpg"}
                        alt={account.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {CATEGORIES[
                            account.category as keyof typeof CATEGORIES
                          ] || account.category}
                        </Badge>
                        {account.collector_level && (
                          <Badge variant="outline" className="text-xs">
                            {account.collector_level}
                          </Badge>
                        )}
                        {account.discount && (
                          <Badge className="bg-green-500 text-xs">
                            -{account.discount}% OFF
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2 hover:text-primary transition-colors">
                        {account.title}
                      </h3>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          {account.discount ? (
                            <>
                              <span className="font-bold text-primary">
                                {finalPrice.toLocaleString()} MMK
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                {account.price.toLocaleString()} MMK
                              </span>
                            </>
                          ) : (
                            <span className="font-bold text-primary">
                              {account.price.toLocaleString()} MMK
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {account.description}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
