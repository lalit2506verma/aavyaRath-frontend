import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
import { apiClient } from "@/App";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight } from "lucide-react";

const CategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, productsRes] = await Promise.all([
          apiClient.get(`/categories/${slug}`),
          apiClient.get(
            `/products?category=${slug}&sort=${sortBy}&page=${page}&limit=12`,
          ),
        ]);
        setCategory(catRes.data);
        setProducts(productsRes.data.products);
        setTotalPages(productsRes.data.pages);
      } catch (error) {
        console.error("Error fetching category:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, sortBy, page]);

  if (loading && !category) {
    return (
      <Layout>
        <div className="container-custom section-padding">
          <ProductGridSkeleton count={8} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Banner */}
      <div
        className="relative h-64 md:h-80 flex items-center justify-center text-center"
        style={{
          backgroundImage: `url(${category?.image || "https://images.unsplash.com/photo-1628072380604-22bcabb71740"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        data-testid="category-hero"
      >
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 text-white">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold mb-3">
            {category?.name}
          </h1>
          <p className="text-white/80 max-w-md mx-auto px-4">
            {category?.description}
          </p>
        </div>
      </div>

      <div className="container-custom section-padding">
        {/* Breadcrumb */}
        <nav className="breadcrumb mb-8">
          <Link to="/">Home</Link>
          <ChevronRight size={14} className="text-muted-foreground" />
          <Link to="/shop">Shop</Link>
          <ChevronRight size={14} className="text-muted-foreground" />
          <span className="text-foreground">{category?.name}</span>
        </nav>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-muted-foreground">
            {products.length} products
          </p>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="bestseller">Best Selling</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3 className="font-semibold text-lg mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              Check back soon for new arrivals!
            </p>
            <Link to="/shop">
              <Button>Browse All Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                variant={page === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        )}

        {/* Category Description */}
        {category?.description_long && (
          <div className="mt-16 max-w-3xl">
            <h2 className="heading-md mb-4">About {category.name}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {category.description_long}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoryPage;
