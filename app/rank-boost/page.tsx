"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/ui/navbar";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Footer from "@/components/ui/footer";
import Loading from "@/components/loading/Loading";

export default function RankBoostPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("rank_boost")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setServices(data || []);
      } catch (err) {
        console.error("Error fetching rank boost services:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

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

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold uppercase text-foreground md:text-4xl mb-5">
          <span className="text-muted-foreground/30">Rank Boost </span>
          Services
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s.id}
              className="border  rounded-lg p-4 bg-card shadow-sm flex gap-5 flex-col justify-center text-center"
            >
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {s.title}
                </h3>
              </div>

              <div className="text-xl font-bold">
                {s.price !== "0" ? `${s.price} MMK` : "Negotiable"}
              </div>

              <div>
                <Button asChild>
                  <Link
                    href={`https://t.me/natmin8?text=${encodeURIComponent(
                      s.title
                    )}%20Rank%20Boost%20ချင်လို့ပါ။!`}
                  >
                    Boost Now
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No rank boost services available.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
