import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
import { apiClient } from "@/App";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SlidersHorizontal, Grid3X3, List, X } from "lucide-react";

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState("grid");

  // Filter state
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get("category")?.split(",").filter(Boolean) || [],
  );
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1,
  );
  const searchQuery = searchParams.get("search") || "";

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategories.length > 0)
        params.set("category", selectedCategories[0]);
      if (searchQuery) params.set("search", searchQuery);
      if (priceRange[0] > 0) params.set("min_price", priceRange[0]);
      if (priceRange[1] < 5000) params.set("max_price", priceRange[1]);
      if (inStockOnly) params.set("in_stock", "true");
      params.set("sort", sortBy);
      params.set("page", currentPage);
      params.set("limit", 12);

      const response = await apiClient.get(`/products?${params.toString()}`);
      setProducts(response.data.products);
      setTotalProducts(response.data.total);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [
    selectedCategories,
    searchQuery,
    priceRange,
    inStockOnly,
    sortBy,
    currentPage,
  ]);

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
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategories.length > 0)
      params.set("category", selectedCategories.join(","));
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (currentPage > 1) params.set("page", currentPage);
    if (searchQuery) params.set("search", searchQuery);
    setSearchParams(params);
  }, [selectedCategories, sortBy, currentPage, searchQuery, setSearchParams]);

  const handleCategoryToggle = (slug) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug],
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 5000]);
    setInStockOnly(false);
    setCurrentPage(1);
  };

  const activeFilterCount =
    selectedCategories.length +
    (priceRange[0] > 0 || priceRange[1] < 5000 ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="font-medium mb-3">Categories</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category.category_id}
              className="flex items-center gap-3 cursor-pointer"
            >
              <Checkbox
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => handleCategoryToggle(category.slug)}
                data-testid={`filter-category-${category.slug}`}
              />
              <span className="text-sm">{category.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                ({category.product_count || 0})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-medium mb-3">Price Range</h4>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={0}
            max={5000}
            step={100}
            className="mb-3"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* In Stock */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={inStockOnly}
            onCheckedChange={setInStockOnly}
            data-testid="filter-in-stock"
          />
          <span className="text-sm">In Stock Only</span>
        </label>
      </div>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={clearFilters}
          data-testid="clear-filters-btn"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="container-custom section-padding">
        {/* Header */}
        <div className="mb-8">
          <nav className="breadcrumb mb-4">
            <Link to="/">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="text-foreground">Shop</span>
          </nav>
          <h1 className="heading-md">
            {searchQuery ? `Search: "${searchQuery}"` : "Shop All Products"}
          </h1>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside
            className="hidden lg:block w-64 flex-shrink-0"
            data-testid="filter-sidebar"
          >
            <div className="sticky top-24">
              <h3 className="font-semibold mb-4">Filters</h3>
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="lg:hidden gap-2"
                      data-testid="mobile-filter-btn"
                    >
                      <SlidersHorizontal size={16} />
                      Filters
                      {activeFilterCount > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-white rounded-full">
                          {activeFilterCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {products.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {totalProducts}
                  </span>{" "}
                  products
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger
                    className="w-[160px]"
                    data-testid="sort-select"
                  >
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="bestseller">Best Selling</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="hidden sm:flex border border-border rounded-md">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-muted" : ""}`}
                    aria-label="Grid view"
                  >
                    <Grid3X3 size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-muted" : ""}`}
                    aria-label="List view"
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategories.map((slug) => {
                  const cat = categories.find((c) => c.slug === slug);
                  return (
                    <button
                      key={slug}
                      onClick={() => handleCategoryToggle(slug)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-sm rounded-full hover:bg-secondary/80"
                    >
                      {cat?.name || slug}
                      <X size={14} />
                    </button>
                  );
                })}
                {(priceRange[0] > 0 || priceRange[1] < 5000) && (
                  <button
                    onClick={() => setPriceRange([0, 5000])}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-sm rounded-full hover:bg-secondary/80"
                  >
                    ₹{priceRange[0]} - ₹{priceRange[1]}
                    <X size={14} />
                  </button>
                )}
                {inStockOnly && (
                  <button
                    onClick={() => setInStockOnly(false)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-sm rounded-full hover:bg-secondary/80"
                  >
                    In Stock
                    <X size={14} />
                  </button>
                )}
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <ProductGridSkeleton count={12} />
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <SlidersHorizontal size={32} />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-4 md:gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-2 md:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {products.map((product) => (
                    <ProductCard key={product.product_id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShopPage;
