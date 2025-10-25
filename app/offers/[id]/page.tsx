"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { supabase } from "@/lib/supabase";
import { CATEGORIES, CONTACT_LINKS } from "@/lib/constants";
import { MessageCircle, Phone, ArrowLeft, RefreshCw } from "lucide-react";
import { useLanguage } from "@/lib/language";
import Loading from "@/components/loading/Loading";
import { BackButton } from "@/components/ui/BackButton";
import { FaTelegram } from "react-icons/fa";
import { FaViber } from "react-icons/fa";

interface Account {
  id: string;
  title: string;
  description: string;
  price: number;
  skins: number;
  collector_level?: string;
  is_sold?: boolean;
  images: string[];
}

export default function OfferDetailPage() {
  const params = useParams();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const accountId = params.id as string;

  const fetchAccount = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          setError("Account not found");
        } else {
          setError("Error loading account");
        }
        return;
      }

      if (!data) {
        setError("Account not found");
        return;
      }

      setAccount(data);
    } catch (err) {
      setError("Failed to load account");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!accountId) {
      setError("No ID provided");
      setLoading(false);
      return;
    }
    fetchAccount(accountId);
  }, [accountId, fetchAccount]);

  const handleRetry = useCallback(() => {
    if (accountId) {
      fetchAccount(accountId);
    }
  }, [accountId, fetchAccount]);

  const telegramUrl = useMemo(() => {
    if (!account) return "";
    return `https://t.me/KIM_2Thousand7?text=${encodeURIComponent(
      account.title
    )}%20ဒီအကောင့်လေး%20ဝယ်ချင်လို့ပါ။!`;
  }, [account]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Loading />
      </div>
    );
  }

  // Error state
  if (error || !account) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-destructive">
              Account Not Found
            </h1>
            <p className="text-muted-foreground">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleRetry} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button asChild variant="outline">
                <Link href="/offers">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Offers
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className=" sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className=" px-4 h-14 justify-between flex items-center">
          <Button onClick={() => history.back()}>← Back</Button>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {/* <div className="fixed top-20 right-5 z-50">
          <BackButton>Back</BackButton>
        </div> */}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div>
            <ImageCarousel images={account.images} title={account.title} />
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <h2 className="text-3xl pt-8 font-bold text-foreground md:text-4xl">
              <span className="text-muted-foreground/30">ACCOUNT </span>
              INFO
            </h2>
            <Card>
              <div className=" flex flex-col gap-3">
                <div className=" flex justify-between">
                  <CardHeader>
                    <CardTitle>Code</CardTitle>
                  </CardHeader>
                  <CardHeader>
                    <CardTitle>
                      <p className=" text-accent">{account.title}</p>
                    </CardTitle>
                  </CardHeader>
                </div>
                <hr />

                <div className=" flex justify-between">
                  <CardHeader>
                    <CardTitle>Skins</CardTitle>
                  </CardHeader>
                  <CardHeader>
                    <CardTitle>
                      <p className=" text-accent">{account.skins}</p>
                    </CardTitle>
                  </CardHeader>
                </div>
                <hr />

                <div className=" flex justify-between">
                  <CardHeader>
                    <CardTitle>Level</CardTitle>
                  </CardHeader>
                  <CardHeader>
                    <CardTitle>
                      <p className=" text-accent">{account.collector_level}</p>
                    </CardTitle>
                  </CardHeader>
                </div>
                <hr />
                <div className=" flex justify-between align-middle items-center">
                  <CardHeader>
                    <CardTitle>Price</CardTitle>
                  </CardHeader>
                  <CardHeader>
                    <CardTitle>
                      <p className=" text-accent">
                        {account?.price.toLocaleString()} MMK
                      </p>
                    </CardTitle>
                  </CardHeader>
                </div>
              </div>
            </Card>

            <DescriptionCard description={account.description} />
            <ContactCard telegramUrl={telegramUrl} />
          </div>
        </div>
      </main>
    </div>
  );
}

// Extracted components for better performance and reusability
interface PriceDisplayProps {
  price: number;
  discount?: number;
  finalPrice: number;
}

function PriceDisplay({ price, discount, finalPrice }: PriceDisplayProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      {discount ? (
        <>
          <span className="text-3xl font-bold text-primary">
            {finalPrice.toLocaleString()} MMK
          </span>
          <span className="text-xl text-muted-foreground line-through">
            {price.toLocaleString()} MMK
          </span>
          <Badge className="bg-green-500 hover:bg-green-600">
            -{discount}% OFF
          </Badge>
        </>
      ) : (
        <span className="text-3xl font-bold text-primary">
          {price.toLocaleString()} MMK
        </span>
      )}
    </div>
  );
}

interface DescriptionCardProps {
  description: string;
}

function DescriptionCard({ description }: DescriptionCardProps) {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("offer.description")}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

interface ContactCardProps {
  telegramUrl: string;
}

function ContactCard({ telegramUrl }: ContactCardProps) {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("contact.seller")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className=" flex justify-between items-center">
          <Button asChild size="lg">
            <a
              href={CONTACT_LINKS.viber}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaViber className="mr-2 h-5 w-10" />
              {t("contact.viber")}
            </a>
          </Button>
          <Button asChild size="lg">
            <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
              <FaTelegram className="mr-2 h-5 w-5" />
              {t("contact.telegram")}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
