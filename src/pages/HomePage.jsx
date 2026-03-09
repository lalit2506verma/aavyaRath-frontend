import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
import { apiClient } from "@/App";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Leaf,
  Heart,
  Package,
  Award,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      text: "The resin coasters I ordered are absolutely stunning! Each piece is unique and beautifully crafted. The quality exceeded my expectations.",
      rating: 5,
    },
    {
      id: 2,
      name: "Rahul Mehta",
      text: "Bought wooden toys for my kids and they love them! Safe, beautiful, and durable. Will definitely order more.",
      rating: 5,
    },
    {
      id: 3,
      name: "Ananya Patel",
      text: "The wooden vase is a centerpiece in my living room. Such elegant craftsmanship. Highly recommend Artisan Home!",
      rating: 5,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, newArrivalsRes, categoriesRes] = await Promise.all([
          apiClient.get("/products/featured"),
          apiClient.get("/products/new-arrivals"),
          apiClient.get("/categories"),
        ]);
        setFeaturedProducts(featuredRes.data);
        setNewArrivals(newArrivalsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <Layout>
      {/* Hero Section */}
      <section
        className="relative min-h-[85vh] flex items-center overflow-hidden"
        data-testid="hero-section"
      >
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1760445530319-c2f9f639828f?w=1920)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-transparent" />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-6 animate-fade-in">
              Handcrafted with Love
            </span>
            <h1 className="heading-xl mb-6 animate-fade-in-up">
              AavyaRath Home Decor
              <br />
              <span className="text-primary">Made to Last</span>
            </h1>
            <p className="body-lg text-muted-foreground mb-8 max-w-lg animate-fade-in-up stagger-1">
              Discover our collection of handcrafted resin art, wooden toys, and
              unique home decor pieces. Each item tells a story of craftsmanship
              and care.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-2">
              <Link to="/shop">
                <Button
                  size="lg"
                  className="btn-primary gap-2"
                  data-testid="shop-now-btn"
                >
                  Shop Now <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="btn-outline">
                  Our Story
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative element
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${i === 0 ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div> */}
      </section>

      {/* Categories Section */}
      <section
        className="section-padding bg-muted/30"
        data-testid="categories-section"
      >
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="heading-md mb-3">Shop by Category</h2>
            <p className="body-base max-w-md mx-auto">
              Explore our carefully curated collections
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link
                key={category.category_id}
                to={`/category/${category.slug}`}
                className="category-card group text-center p-6 bg-card rounded-2xl border border-border/40"
                data-testid={`category-card-${category.slug}`}
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-muted">
                  <img
                    src={
                      category.image ||
                      "https://images.unsplash.com/photo-1628072380604-22bcabb71740"
                    }
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-medium text-sm mb-1">{category.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {category.product_count || 0} items
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding" data-testid="featured-section">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="heading-md mb-2">Best Sellers</h2>
              <p className="body-base">Our most loved products</p>
            </div>
            <Link
              to="/shop?sort=bestseller"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/shop?sort=bestseller">
              <Button variant="outline" className="gap-2">
                View All Products <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section
        className="section-padding bg-primary/5 noise-overlay"
        data-testid="story-section"
      >
        <div className="container-custom relative z-10">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="order-2 md:order-1">
              <span className="text-primary text-sm font-medium uppercase tracking-wider mb-4 block">
                Our Story
              </span>
              <h2 className="heading-md mb-6">
                Crafted by Hand,
                <br />
                Cherished for Life
              </h2>
              <p className="body-base mb-6">
                Every piece at Artisan Home is handcrafted by skilled artisans
                using traditional techniques passed down through generations. We
                believe in creating products that are not just beautiful, but
                sustainable and meaningful.
              </p>
              <p className="body-base mb-8">
                From resin art that captures the beauty of nature to wooden toys
                that spark imagination, our collections are designed to bring
                warmth and character to your home.
              </p>
              <Link to="/about">
                <Button className="btn-primary gap-2">
                  Learn Our Story <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
            <div className="order-1 md:order-2 relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1771849316389-dbd4db5dee77"
                  alt="Artisan at work"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-card p-4 rounded-xl shadow-soft-lg border border-border/40 hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="text-primary" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold">500+</p>
                    <p className="text-xs text-muted-foreground">
                      Happy Customers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section-padding" data-testid="new-arrivals-section">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="heading-md mb-2">New Arrivals</h2>
              <p className="body-base">Fresh additions to our collection</p>
            </div>
            <Link
              to="/shop?sort=newest"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.slice(0, 4).map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section
        className="section-padding bg-secondary/30"
        data-testid="features-section"
      >
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center p-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Leaf className="text-primary" size={24} />
              </div>
              <h3 className="font-medium mb-2">Eco-Friendly</h3>
              <p className="text-sm text-muted-foreground">
                Sustainable materials & practices
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="text-primary" size={24} />
              </div>
              <h3 className="font-medium mb-2">Handcrafted</h3>
              <p className="text-sm text-muted-foreground">
                Made with love & care
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="text-primary" size={24} />
              </div>
              <h3 className="font-medium mb-2">Free Shipping</h3>
              <p className="text-sm text-muted-foreground">
                On orders above ₹999
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="text-primary" size={24} />
              </div>
              <h3 className="font-medium mb-2">Quality Promise</h3>
              <p className="text-sm text-muted-foreground">
                7-day easy returns
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding" data-testid="testimonials-section">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="heading-md mb-3">What Our Customers Say</h2>
            <p className="body-base max-w-md mx-auto">
              Real reviews from real people
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="testimonial-card relative">
              {/* Stars */}
              <div className="flex justify-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className={
                      star <= testimonials[testimonialIndex].rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-muted"
                    }
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-lg text-center mb-6 leading-relaxed">
                "{testimonials[testimonialIndex].text}"
              </p>

              {/* Author */}
              <p className="text-center font-medium">
                — {testimonials[testimonialIndex].name}
              </p>

              {/* Navigation */}
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() =>
                    setTestimonialIndex(
                      (prev) =>
                        (prev - 1 + testimonials.length) % testimonials.length,
                    )
                  }
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === testimonialIndex ? "bg-primary" : "bg-muted"}`}
                  />
                ))}
                <button
                  onClick={() =>
                    setTestimonialIndex(
                      (prev) => (prev + 1) % testimonials.length,
                    )
                  }
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
