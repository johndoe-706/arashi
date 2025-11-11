"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Search, Menu, Sun, Moon, Globe, LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Logo2 from "../image/Logo2.png";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/language";

// Define empty array as constant to avoid re-renders
const EMPTY_ARRAY: any[] = [];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>(EMPTY_ARRAY);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const router = useRouter();

  const navLinks = [
    { href: "https://t.me/AraShiGameServices", label: "Channel" },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsAdmin(!!session);
      } catch (err) {
        console.error("Auth check error", err);
        setIsAdmin(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAdmin(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Add the handleSignOut function here
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setIsAdmin(false);
      router.push("/");
      router.refresh(); // Refresh the page to update the state
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Search function - fixed with proper typing
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults(EMPTY_ARRAY);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from("accounts")
        .select("id, title, price, images, is_sold")
        .ilike("title", `%${query}%`)
        .eq("is_sold", false)
        .limit(8);

      if (error) throw error;

      // Use nullish coalescing with the constant
      const results = data ?? EMPTY_ARRAY;
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults(EMPTY_ARRAY);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const handleResultClick = useCallback(
    (accountId: string) => {
      setSearchOpen(false);
      setSearchQuery("");
      setSearchResults(EMPTY_ARRAY);
      setIsOpen(false);
      router.push(`/offers/${accountId}`);
    },
    [router]
  );

  const handleViewAllResults = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults(EMPTY_ARRAY);
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  }, [searchQuery, router]);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        setSearchOpen(false);
        setSearchQuery("");
        setSearchResults(EMPTY_ARRAY);
        setIsOpen(false);
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
    },
    [searchQuery, router]
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-black">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center ">
            <Image
              src={Logo2}
              alt="Logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain "
              priority
            />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              ARASHI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <>
                <Link
                  href="/admin/accounts"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Manage Accounts
                </Link>
                <Link
                  href="/admin/ads"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Manage Ads
                </Link>
                <Link
                  href="/admin/boost"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Manage Rank Boost
                </Link>
                <Link
                  href="/admin/profile"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Profile
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-sm"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            )}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-2">
            {/* Search Dialog */}
            <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Search Accounts</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSearchSubmit}>
                  <div className="space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by account title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        autoFocus
                      />
                    </div>

                    {/* Search Results */}
                    <div className="max-h-60 overflow-y-auto">
                      {isSearching ? (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">
                            Searching...
                          </p>
                        </div>
                      ) : searchQuery && searchResults.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">
                            No accounts found matching "{searchQuery}"
                          </p>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="space-y-2">
                          {searchResults.map((account) => (
                            <div
                              key={account.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                              onClick={() => handleResultClick(account.id)}
                            >
                              <div className="flex items-center space-x-3">
                                {account.images &&
                                  account.images.length > 0 && (
                                    <div className="w-10 h-10 relative rounded overflow-hidden">
                                      <Image
                                        src={account.images[0]}
                                        alt={account.title}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  )}
                                <div>
                                  <p className="text-sm font-medium line-clamp-1">
                                    {account.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {account.price?.toLocaleString()} MMK
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* View All Results */}
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full mt-2"
                            onClick={handleViewAllResults}
                          >
                            View All Results ({searchResults.length})
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">
                            Type to search for accounts
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Desktop Controls */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Language Selector */}
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-20 text-black dark:text-white">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">EN</SelectItem>
                  <SelectItem value="mm">MM</SelectItem>
                </SelectContent>
              </Select>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              {/* Admin Login/Logout button */}
              {!isAdmin ? (
                <Link href="/admin/login">
                  <Button variant="outline" size="sm" className="ml-2 text-white hover:text-black">
                    Admin Login
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="ml-2"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              )}
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="top"
                  className="w-full h-fit max-h-[90vh] overflow-y-auto"
                >
                  {/* Header with close button */}
                  <div className="flex items-center justify-between mb-6">
                    <Link
                      href="/"
                      className="flex items-center"
                      onClick={() => setIsOpen(false)}
                    >
                      <Image
                        src={Logo2}
                        alt="Logo"
                        width={32}
                        height={32}
                        className="h-8 w-8 object-contain"
                      />
                      <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent ml-2">
                        ARASHI
                      </span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex flex-col space-y-6">
                    {/* Navigation Links */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Navigation
                      </h3>
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="block text-base font-medium transition-colors hover:text-primary py-2"
                          onClick={() => setIsOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                      {isAdmin && (
                        <>
                          <div className="border-t pt-4 mt-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                              Admin
                            </h3>
                            <Link
                              href="/admin/accounts"
                              className="block text-base font-medium transition-colors hover:text-primary py-2"
                              onClick={() => setIsOpen(false)}
                            >
                              Manage Accounts
                            </Link>
                            <Link
                              href="/admin/ads"
                              className="block text-base font-medium transition-colors hover:text-primary py-2"
                              onClick={() => setIsOpen(false)}
                            >
                              Manage Ads
                            </Link>
                            <Link
                              href="/admin/boost"
                              className="block text-base font-medium transition-colors hover:text-primary py-2"
                              onClick={() => setIsOpen(false)}
                            >
                              Manage Rank Boost
                            </Link>
                            <Link
                              href="/admin/profile"
                              className="block text-base font-medium transition-colors hover:text-primary py-2"
                              onClick={() => setIsOpen(false)}
                            >
                              Profile
                            </Link>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Mobile Controls */}
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Settings
                      </h3>

                      {/* Language Selector */}
                      <div className="flex items-center justify-between py-2">
                        <span className="text-base font-medium">Language</span>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="w-24">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="mm">Myanmar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Theme Toggle */}
                      <div className="flex items-center justify-between py-2">
                        <span className="text-base font-medium">Theme</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setTheme(theme === "light" ? "dark" : "light")
                          }
                          className="flex items-center gap-2"
                        >
                          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                          <Moon className="h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                          <span className="hidden sm:inline">
                            {theme === "light" ? "Dark" : "Light"}
                          </span>
                        </Button>
                      </div>
                    </div>

                    {/* Admin Login/Logout button in Mobile */}
                    <div className="pt-4 border-t">
                      {!isAdmin ? (
                        <Link href="/admin/login">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setIsOpen(false)}
                          >
                            Admin Login
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            handleSignOut();
                            setIsOpen(false);
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
