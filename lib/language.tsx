"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "mm";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    "nav.admin": "Admin",
    "nav.home": "Home",
    "nav.logout": "Logout",
    "hero.title": "Premium Game Accounts Shop",
    "hero.subtitle":
      "Find your perfect gaming account. Top-ranked, verified, and ready to play.",
    "hero.ads": "Special Offers",
    "hero.mlbb_accounts": "Mobile Legend Accounts",
    "hero.explore_mlbb_accounts": "View MLBB Accounts",
    "hero.pubg_accounts": "PUBG Accounts",
    "hero.explore_pubg_accounts": "View PUBG Accounts",
    "hero.new_arrival_mlbb": "New Arrival MLBB",
    "hero.new_arrival_pubg": "New Arrival PUBG",

    "offer.back": "Back to Home",
    "offer.sold": "Sold Out",
    "offer.description": "Description",
    "contact.seller": "Contact Seller",
    "contact.telegram": "Telegram",
    "contact.viber": "Viber",

    "category.mobile_legend": "Mobile Legends",
    "category.pubg": "PUBG Mobile",
    "category.all": "All Games",
    "filter.search": "Search accounts...",
    "filter.collector": "Collector Level",
    "filter.all_collectors": "All Collectors",
    "sort.price_low": "Price: Low to High",
    "sort.price_high": "Price: High to Low",
    "sort.newest": "Newest First",
    "offer.details": "View Details",
    "offer.discount": "OFF",
    "offer.price": "Price",
    "offer.collector": "Collector Level",
    "offer.contact": "Contact Seller",
    "admin.new_offer": "New Offer",
    "admin.new_ad": "New Ad",
    "admin.edit": "Edit",
    "admin.delete": "Delete",
    "admin.all": "All",
    "admin.save": "Save",
    "admin.cancel": "Cancel",
    "footer.rights": "All rights reserved.",
  },
  mm: {
    "nav.admin": "စီမံခန့်ခွဲရေး",
    "nav.home": "ပင်မစာမျက်နှာ",
    "nav.logout": "ထွက်ရန်",
    "hero.title": "ပရီမီယံ ဂိမ်းအကောင့်များ",
    "hero.subtitle":
      "သင့်အတွက် အကောင့်ကောင်းများကို ရှာဖွေပါ။ အဆင့်မြင့်၊ အတည်ပြုပြီး၊ ကစားရန် အဆင်သင့်။",
    "hero.ads": "အထူးကမ်းလှမ်းချက်များ",
    "hero.mlbb_accounts": "MLBB အကောင့်များ",
    "hero.explore_mlbb_accounts": "MLBB အကောင့်ကြည့်ရန်",
    "hero.pubg_accounts": "PUBG အကောင့်များ",
    "hero.explore_pubg_accounts": "PUBG အကောင့်ကြည့်ရန်",
    "hero.new_arrival_mlbb": "MLBB အသစ်ရောက်ရှိမှု",
    "hero.new_arrival_pubg": "PUBG အသစ်ရောက်ရှိမှု",

    "offer.back": "ပင်မသို့ ပြန်သွားရန်",
    "offer.description": "ဖော်ပြချက်",
    "offer.sold": "ရောင်းပြီး",
    "contact.seller": "ရောင်းသူကို ဆက်သွယ်ရန်",
    "contact.telegram": "Telegram ဖြင့် ဆက်သွယ်ရန်",
    "contact.viber": "Viber ဖြင့် ဆက်သွယ်ရန်",

    "category.mobile_legend": "မိုဘိုင်းလီဂျင်း",
    "category.pubg": "PUBG မိုဘိုင်း",
    "category.all": "ဂိမ်းအားလုံး",
    "filter.search": "အကောင့်များရှာရန်...",
    "filter.collector": "စုဆောင်းသူအဆင့်",
    "filter.all_collectors": "စုဆောင်းသူအားလုံး",
    "sort.price_low": "စျေးနှုန်း: နည်းမှ မြင့်",
    "sort.price_high": "စျေးနှုန်း: မြင့်မှ နည်း",
    "sort.newest": "အသစ်ဆုံးများ",
    "offer.details": "အသေးစိတ်ကြည့်ရန်",
    "offer.discount": "လျှော့",
    "offer.price": "စျေးနှုန်း",
    "offer.collector": "စုဆောင်းသူအဆင့်",
    "offer.contact": "ရောင်းသူကို ဆက်သွယ်ရန်",
    "admin.new_offer": "အကောင့်အသစ်",
    "admin.new_ad": "ကြော်ငြာအသစ်",
    "admin.edit": "ပြင်ဆင်ရန်",
    "admin.delete": "ဖျက်ရန်",
    "admin.all": "အားလုံး",
    "admin.save": "သိမ်းရန်",
    "admin.cancel": "ပယ်ဖျက်ရန်",
    "footer.rights": "မူပိုင်ခွင့် အားလုံး လက်ဝယ်ရှိသည်။",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("language");
        return (stored as Language) || "en";
      }
      return "en";
    } catch (e) {
      return "en";
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("language", language);
      }
      document.documentElement.lang = language;
    } catch (e) {
      // ignore
    }
  }, [language]);

  const t = (key: string): string => {
    // @ts-ignore
    return (translations as any)[language]?.[key] ?? key;
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    try {
      if (typeof window !== "undefined") localStorage.setItem("language", lang);
    } catch {}
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};

export default LanguageProvider;
