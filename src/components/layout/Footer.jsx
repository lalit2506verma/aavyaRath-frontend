import React, { useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/App";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await apiClient.post("/content/newsletter", { email });
      toast.success("Thank you for subscribing!");
      setEmail("");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer
      className="bg-secondary/30 border-t border-border"
      data-testid="main-footer"
    >
      {/* Newsletter Section */}
      <div className="bg-primary/5 py-12 md:py-16">
        <div className="container-custom text-center">
          <h3 className="font-serif text-2xl md:text-3xl font-semibold mb-3">
            Join Our Community
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Subscribe to receive updates on new arrivals, special offers, and
            artisan stories.
          </p>
          <form
            onSubmit={handleNewsletterSubmit}
            className="flex max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-r-none border-r-0"
              required
              data-testid="newsletter-email"
            />
            <Button
              type="submit"
              className="rounded-l-none"
              disabled={loading}
              data-testid="newsletter-submit"
            >
              {loading ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <h2 className="font-serif text-xl font-semibold">AavyaRath</h2>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Handcrafted with love, made to last. We bring you unique artisanal
              home decor that tells a story.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-muted rounded-full hover:bg-primary hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-muted rounded-full hover:bg-primary hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-muted rounded-full hover:bg-primary hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/shop"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Shop All
                </Link>
              </li>
              <li>
                <Link
                  to="/category/resin-art"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Resin Art
                </Link>
              </li>
              <li>
                <Link
                  to="/category/wooden-toys"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Wooden Toys
                </Link>
              </li>
              <li>
                <Link
                  to="/category/flower-vases"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Flower Vases
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Our Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/faq"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/track-order"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  Shipping Policy
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  Return Policy
                </span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Get in Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail
                  size={18}
                  className="text-muted-foreground mt-0.5 flex-shrink-0"
                />
                <span className="text-sm text-muted-foreground">
                  support@aavyarath.com
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone
                  size={18}
                  className="text-muted-foreground mt-0.5 flex-shrink-0"
                />
                <span className="text-sm text-muted-foreground">
                  +91 98214 477302
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="text-muted-foreground mt-0.5 flex-shrink-0"
                />
                <span className="text-sm text-muted-foreground">
                  123 Artisan Lane, Craft District
                  <br />
                  Faridabad, Haryana 121003
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AavyaRath. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Visa_Inc._logo_%282021%E2%80%93present%29.svg"
                alt="Visa"
                className="h-6 opacity-60"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg"
                alt="Mastercard"
                className="h-6 opacity-60"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6f/UPI_logo.svg"
                alt="UPI"
                className="h-6 opacity-60"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
