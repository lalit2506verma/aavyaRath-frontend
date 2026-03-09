import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useCart, apiClient } from "@/App";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export const Header = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get("/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-soft border-b border-border/40"
          : "bg-background"
      }`}
      data-testid="main-header"
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0" data-testid="logo-link">
            <h1 className="font-serif text-xl md:text-2xl font-semibold text-foreground tracking-tight">
              AavyaRath
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center gap-1"
            data-testid="main-nav"
          >
            <Link
              to="/shop"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Shop All
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Categories <ChevronDown size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {categories.map((cat) => (
                  <DropdownMenuItem key={cat.category_id} asChild>
                    <Link to={`/category/${cat.slug}`} className="w-full">
                      {cat.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to="/about"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Our Story
            </Link>
            <Link
              to="/contact"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Search */}
            <button
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setSearchOpen(!searchOpen)}
              data-testid="search-btn"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            {user && (
              <Link
                to="/account/wishlist"
                className="p-2 text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
                data-testid="wishlist-link"
              >
                <Heart size={20} />
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors relative"
              data-testid="cart-link"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="cart-badge" data-testid="cart-count">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="user-menu-btn"
                  >
                    <User size={20} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="w-full">
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account/orders" className="w-full">
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account/wishlist" className="w-full">
                      Wishlist
                    </Link>
                  </DropdownMenuItem>
                  {["admin", "superadmin"].includes(user.role) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="w-full">
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive"
                  >
                    <LogOut size={16} className="mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex"
                  data-testid="login-btn"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="py-4 border-t border-border/40 animate-fade-in">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                autoFocus
                data-testid="search-input"
              />
              <Button type="submit" data-testid="search-submit-btn">
                Search
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 top-16 bg-background z-40 animate-slide-in"
          data-testid="mobile-menu"
        >
          <nav className="container-custom py-6 space-y-4">
            <Link
              to="/shop"
              className="block py-3 text-lg font-medium border-b border-border/40"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.category_id}
                to={`/category/${cat.slug}`}
                className="block py-3 text-lg font-medium border-b border-border/40"
                onClick={() => setMobileMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <Link
              to="/about"
              className="block py-3 text-lg font-medium border-b border-border/40"
              onClick={() => setMobileMenuOpen(false)}
            >
              Our Story
            </Link>
            <Link
              to="/contact"
              className="block py-3 text-lg font-medium border-b border-border/40"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              to="/faq"
              className="block py-3 text-lg font-medium border-b border-border/40"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            {!user && (
              <div className="pt-4 space-y-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Login</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Create Account
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
