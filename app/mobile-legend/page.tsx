"use client";

import { useCallback, useEffect, useState } from "react";
import { Navbar } from "@/components/ui/navbar";
import { AccountCard } from "@/components/ui/account-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { COLLECTOR_LEVELS } from "@/lib/constants";
import { GameCard } from "@/components/ui/GameCard";
import Link from "next/link";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useLanguage } from "@/lib/language";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import Footer from "@/components/ui/footer";
import Loading from "@/components/loading/Loading";

// Define empty array as constant to avoid re-renders
const EMPTY_ARRAY: any[] = [];

export default function MobileLegendPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(12);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const fetchAccounts = async (pageNumber = 1) => {
      setLoading(true);
      try {
        const from = (pageNumber - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await supabase
          .from("accounts")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) throw error;
        setAccounts(data || []);
        setTotal(count ?? 0);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts(page);
  }, [page, pageSize]);

  useEffect(() => {
    if (selectedLevel === "all") {
      setFilteredAccounts(accounts);
    } else {
      setFilteredAccounts(
        accounts.filter((account) => account.collector_level === selectedLevel)
      );
    }
  }, [accounts, selectedLevel]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* nav collector sort: badge buttons for collector levels */}
      <nav className="sticky top-0  z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className=" px-4 h-fit py-4 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedLevel("all")}
            className={`px-3 py-1 rounded-md border text-sm ${
              selectedLevel === "all"
                ? "bg-primary text-white"
                : "bg-transparent"
            }`}
          >
            All Levels
          </button>
          {COLLECTOR_LEVELS.filter(
            (level) =>
              level !== "Expert collector" && level !== "Discount Accounts"
          ).map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-3 py-1 rounded-md border text-sm ${
                selectedLevel === level
                  ? "bg-primary text-white"
                  : "bg-transparent"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            <span className="text-muted-foreground/30">MLBB </span>
            ACCOUNTS
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredAccounts.map((account) => (
            <Link href={`/offers/${account.id}`} key={account.id}>
              <GameCard
                key={account.id}
                id={account.id}
                title={account.title}
                price={account.price}
                collectorLevel={account.collector_level}
                skins={50}
                image={account?.images[0]}
                is_sold={account.is_sold}
              />
            </Link>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            className="px-3 py-1 rounded border"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>

          {/* page numbers */}
          {Array.from({ length: Math.max(1, Math.ceil(total / pageSize)) }).map(
            (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  className={`px-3 py-1 rounded border ${
                    pageNum === page
                      ? "bg-primary dark:text-black text-white"
                      : ""
                  }`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            }
          )}

          <button
            className="px-3 py-1 rounded border"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / pageSize)}
          >
            Next
          </button>
        </div>

        {filteredAccounts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {selectedLevel === "all"
                ? "No accounts available"
                : `No accounts found for ${selectedLevel}`}
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
