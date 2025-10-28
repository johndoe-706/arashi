"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { supabase } from "@/lib/supabase";
import { CONTACT_LINKS } from "@/lib/constants";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useLanguage } from "@/lib/language";
import Loading from "@/components/loading/Loading";
import { FaTelegram, FaViber } from "react-icons/fa";
import Footer from "@/components/ui/footer";

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
        setError(
          error.code === "PGRST116"
            ? "Account not found"
            : "Error loading account"
        );
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
    accountId && fetchAccount(accountId);
  }, [accountId, fetchAccount]);

  const telegramUrl = useMemo(() => {
    if (!account) return "";
    return `https://t.me/natmin8?text=${encodeURIComponent(
      account.title
    )}%20ဒီအကောင့်လေး%20ဝယ်ချင်လို့ပါ။!`;
  }, [account]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Loading />
      </div>
    );
  }

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
      <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 h-14 justify-between flex items-center">
          <Button onClick={() => history.back()}>← Back</Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <ImageCarousel images={account.images} title={account.title} />
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl pt-8 font-bold text-foreground md:text-4xl">
              <span className="text-muted-foreground/30">ACCOUNT </span>
              INFO
            </h2>

            <AccountInfoCard account={account} />
            <DescriptionCard description={account.description} />
            <ContactCard telegramUrl={telegramUrl} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

interface AccountInfoCardProps {
  account: Account;
}

function AccountInfoCard({ account }: AccountInfoCardProps) {
  const infoItems = [
    { label: "Code", value: account.title },
    { label: "Skins", value: account.skins },
    { label: "Level", value: account.collector_level },
    { label: "Price", value: `${account.price.toLocaleString()} MMK` },
  ];

  return (
    <Card>
      <div className="flex flex-col gap-3">
        {infoItems.map((item, index) => (
          <div key={item.label}>
            <div className="flex justify-between items-center px-6 py-4">
              <CardTitle className="text-base">{item.label}</CardTitle>
              <p className="text-accent font-semibold">{item.value}</p>
            </div>
            {index < infoItems.length - 1 && <hr />}
          </div>
        ))}
      </div>
    </Card>
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

  const contactButtons = [
    {
      href: CONTACT_LINKS.viber,
      icon: FaViber,
      label: t("contact.viber"),
    },
    {
      href: telegramUrl,
      icon: FaTelegram,
      label: t("contact.telegram"),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("contact.seller")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          {contactButtons.map((button) => (
            <Button key={button.label} asChild size="lg">
              <a href={button.href} target="_blank" rel="noopener noreferrer">
                <button.icon className="mr-2 h-5 w-5" />
                {button.label}
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
