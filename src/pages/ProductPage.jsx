import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/ProductCard";
import { apiClient, useAuth, useCart } from "@/App";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Star,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
} from "lucide-react";

const ProductPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToCart, loading: cartLoading } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/products/${slug}`);
        setProduct(response.data);
        setSelectedImage(0);

        // Fetch related products
        if (response.data.product_id) {
          const relatedRes = await apiClient.get(
            `/products/${response.data.product_id}/related`,
          );
          setRelatedProducts(relatedRes.data);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Product not found");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }

    try {
      await addToCart(product.product_id, quantity);
      toast.success("Added to cart!");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      toast.error("Please login to add to wishlist");
      return;
    }

    try {
      if (isWishlisted) {
        await apiClient.delete(`/wishlist/${product.product_id}`);
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        await apiClient.post(`/wishlist/${product.product_id}`);
        setIsWishlisted(true);
        toast.success("Added to wishlist!");
      }
    } catch (error) {
      toast.error("Failed to update wishlist");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product.name,
        text: product.short_description,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const discountPercent = product?.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;

  if (loading) {
    return (
      <Layout>
        <div className="container-custom section-padding">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container-custom section-padding text-center">
          <h1 className="heading-md mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist.
          </p>
          <Link to="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        className="container-custom section-padding"
        data-testid="product-detail-page"
      >
        {/* Breadcrumb */}
        <nav className="breadcrumb mb-6">
          <Link to="/">Home</Link>
          <ChevronRight size={14} className="text-muted-foreground" />
          <Link to="/shop">Shop</Link>
          {product.category_name && (
            <>
              <ChevronRight size={14} className="text-muted-foreground" />
              <Link to={`/category/${product.category_slug}`}>
                {product.category_name}
              </Link>
            </>
          )}
          <ChevronRight size={14} className="text-muted-foreground" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
              <img
                src={
                  product.images?.[selectedImage] ||
                  "https://images.unsplash.com/photo-1628072380604-22bcabb71740"
                }
                alt={product.name}
                className="w-full h-full object-cover"
                data-testid="product-main-image"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_new_arrival && (
                  <Badge className="badge-new">New</Badge>
                )}
                {product.is_sale && discountPercent > 0 && (
                  <Badge className="badge-sale">-{discountPercent}%</Badge>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`gallery-thumbnail w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${
                      selectedImage === index ? "active" : ""
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Category */}
            {product.category_name && (
              <Link
                to={`/category/${product.category_slug}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {product.category_name}
              </Link>
            )}

            {/* Name */}
            <h1
              className="font-serif text-3xl md:text-4xl font-semibold mt-2 mb-3"
              data-testid="product-name"
            >
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating_count > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      className={
                        star <= Math.round(product.rating_average)
                          ? "text-amber-400 fill-amber-400"
                          : "text-muted"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating_average} ({product.rating_count} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span
                className="text-3xl font-semibold"
                data-testid="product-price"
              >
                ₹{product.price.toLocaleString()}
              </span>
              {product.compare_at_price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.compare_at_price.toLocaleString()}
                  </span>
                  <Badge className="badge-sale">{discountPercent}% OFF</Badge>
                </>
              )}
            </div>

            {/* Short Description */}
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {product.short_description}
            </p>

            {/* Specifications quick view */}
            {product.specifications?.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-muted/30 rounded-lg">
                {product.specifications.slice(0, 4).map((spec, index) => (
                  <div key={index}>
                    <p className="text-xs text-muted-foreground">{spec.key}</p>
                    <p className="text-sm font-medium">{spec.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="quantity-selector">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  data-testid="quantity-minus"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(
                        1,
                        Math.min(product.stock, parseInt(e.target.value) || 1),
                      ),
                    )
                  }
                  min={1}
                  max={product.stock}
                  data-testid="quantity-input"
                />
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  disabled={quantity >= product.stock}
                  data-testid="quantity-plus"
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className="text-sm text-muted-foreground">
                {product.stock} in stock
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <Button
                size="lg"
                className="flex-1 gap-2"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || cartLoading}
                data-testid="add-to-cart-btn"
              >
                <ShoppingBag size={20} />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleWishlist}
                className={isWishlisted ? "text-red-500 border-red-500" : ""}
                data-testid="wishlist-btn"
              >
                <Heart
                  size={20}
                  fill={isWishlisted ? "currentColor" : "none"}
                />
              </Button>
              <Button size="lg" variant="outline" onClick={handleShare}>
                <Share2 size={20} />
              </Button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="flex items-center gap-2 text-sm">
                <Truck size={18} className="text-primary" />
                <span>Free shipping over ₹999</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield size={18} className="text-primary" />
                <span>Secure payment</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <RotateCcw size={18} className="text-primary" />
                <span>7-day returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="description" className="mt-12">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
              value="description"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="specifications"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Specifications
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Reviews ({product.rating_count || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <div className="prose max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {product.description || product.short_description}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            {product.specifications?.length > 0 ? (
              <table className="w-full max-w-2xl">
                <tbody>
                  {product.specifications.map((spec, index) => (
                    <tr key={index} className="border-b border-border">
                      <td className="py-3 text-muted-foreground w-1/3">
                        {spec.key}
                      </td>
                      <td className="py-3 font-medium">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-muted-foreground">
                No specifications available.
              </p>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            {product.reviews?.length > 0 ? (
              <div className="space-y-6">
                {product.reviews.map((review) => (
                  <div
                    key={review.review_id}
                    className="p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={
                              star <= review.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-muted"
                            }
                          />
                        ))}
                      </div>
                      <span className="font-medium text-sm">
                        {review.user_name}
                      </span>
                    </div>
                    {review.title && (
                      <p className="font-medium mb-1">{review.title}</p>
                    )}
                    <p className="text-muted-foreground text-sm">
                      {review.body}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No reviews yet. Be the first to review!
              </p>
            )}
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="heading-md mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Add to Cart Bar (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 md:hidden z-40">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="font-medium text-sm line-clamp-1">{product.name}</p>
            <p className="font-semibold">₹{product.price.toLocaleString()}</p>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || cartLoading}
            className="gap-2"
          >
            <ShoppingBag size={18} />
            Add to Cart
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ProductPage;
